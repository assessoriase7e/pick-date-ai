import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { getAICreditsLimit } from "@/lib/subscription-limits";
import { isLifetimeUser } from "@/lib/lifetime-user";
import { startOfMonth, endOfMonth } from "date-fns";

interface ContactValidationResult {
  canAttend: boolean;
  reason?: string;
  pauseUntil?: Date;
}

interface CachedValidationState {
  isBlacklisted: boolean;
  attendantActive: boolean;
  hasCredits: boolean;
  cachedAt: number;
}

/**
 * Valida se um contato pode ser atendido pelo agente
 * @param userId ID do usuário
 * @param contactPhone Telefone do contato
 * @param instanceName Nome da instância Evolution
 * @param fromMe Se a mensagem é da própria instância
 * @returns Resultado da validação
 */
export async function validateContactForAgent(
  userId: string,
  contactPhone: string,
  instanceName: string,
  fromMe: boolean = false
): Promise<ContactValidationResult> {
  try {
    // Early return para mensagens da própria instância
    const pauseResult = await handleFromMeMessage(fromMe, instanceName);
    if (pauseResult) return pauseResult;

    // Early return para pausas ativas
    const activePauseResult = await checkActivePause(instanceName);
    if (activePauseResult) return activePauseResult;

    // Verificar cache e retornar resultado
    const validationState = await getOrUpdateValidationState(userId, contactPhone);
    return getValidationResult(validationState);
  } catch (error) {
    console.error("Erro na validação de contato:", error);
    return { canAttend: false, reason: "Erro interno na validação" };
  }
}

/**
 * Manipula mensagens da própria instância
 */
async function handleFromMeMessage(fromMe: boolean, instanceName: string): Promise<ContactValidationResult | null> {
  if (!fromMe) return null;

  const pauseKey = `agent_pause:${instanceName}`;
  const pauseUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await redis.setex(pauseKey, 3600, pauseUntil.toISOString());

  return {
    canAttend: false,
    reason: "Atendimento pausado - mensagem da própria instância",
    pauseUntil,
  };
}

/**
 * Verifica se há pausa ativa
 */
async function checkActivePause(instanceName: string): Promise<ContactValidationResult | null> {
  const pauseKey = `agent_pause:${instanceName}`;
  const pauseData = await redis.get(pauseKey);

  return pauseData
    ? {
        canAttend: false,
        reason: "Atendimento pausado temporariamente",
        pauseUntil: new Date(pauseData),
      }
    : null;
}

/**
 * Obtém ou atualiza o estado de validação
 */
async function getOrUpdateValidationState(userId: string, contactPhone: string): Promise<CachedValidationState> {
  const cacheKey = `contact_validation:${userId}:${contactPhone}`;
  const cachedData = await redis.get(cacheKey);

  const cachedState = cachedData ? JSON.parse(cachedData) : null;
  const isCacheValid = cachedState && Date.now() - cachedState.cachedAt < 5 * 60 * 1000;

  if (isCacheValid) return cachedState;

  // Buscar dados atualizados e salvar no cache
  const validationState = await getValidationState(userId, contactPhone);
  await redis.setex(cacheKey, 300, JSON.stringify(validationState));

  return validationState;
}

/**
 * Retorna o resultado da validação baseado no estado
 */
function getValidationResult(state: CachedValidationState): ContactValidationResult {
  const validationChecks = [
    { condition: state.isBlacklisted, reason: "Contato está na lista de bloqueio" },
    { condition: !state.attendantActive, reason: "Atendente não está ativo" },
    { condition: !state.hasCredits, reason: "Créditos de IA esgotados" },
  ];

  const failedCheck = validationChecks.find((check) => check.condition);

  return failedCheck ? { canAttend: false, reason: failedCheck.reason } : { canAttend: true };
}

/**
 * Busca o estado atual de validação no banco de dados
 */
async function getValidationState(userId: string, contactPhone: string): Promise<CachedValidationState> {
  const [blacklistEntry, attendantPrompt, hasCredits] = await Promise.all([
    prisma.blackListPhone.findFirst({
      where: {
        number: contactPhone,
        blackList: { userId },
      },
    }),
    prisma.attendantPrompt.findFirst({
      where: {
        userId,
        isActive: true,
      },
    }),
    checkAICredits(userId),
  ]);

  return {
    isBlacklisted: !!blacklistEntry,
    attendantActive: !!attendantPrompt,
    hasCredits,
    cachedAt: Date.now(),
  };
}

/**
 * Verifica se o usuário ainda tem créditos de IA disponíveis
 */
async function checkAICredits(userId: string): Promise<boolean> {
  try {
    // Verificar se é usuário lifetime primeiro
    const isLifetime = await isLifetimeUser();
    if (isLifetime) {
      // Para usuários lifetime, verificar se não ultrapassou 5000 atendimentos no mês
      const monthlyUsage = await getMonthlyUsage(userId);
      return monthlyUsage < 5000;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        additionalAICredits: {
          where: { active: true },
        },
      },
    });

    if (!user) return false;

    const monthlyLimit = await getAICreditsLimit(user.subscription, true, userId);

    const [monthlyUsage, additionalCredits] = await Promise.all([
      getMonthlyUsage(userId),
      calculateAdditionalCredits(user.additionalAICredits),
    ]);

    const totalAvailable = monthlyLimit + additionalCredits;
    return monthlyUsage < totalAvailable;
  } catch (error) {
    console.error("Erro ao verificar créditos de IA:", error);
    return false;
  }
}

/**
 * Obtém o uso mensal de IA
 */
async function getMonthlyUsage(userId: string): Promise<number> {
  const startOfCurrentMonth = startOfMonth(new Date());
  const endOfCurrentMonth = endOfMonth(new Date());

  return prisma.aIUsage.count({
    where: {
      userId,
      date: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
  });
}

/**
 * Calcula créditos adicionais disponíveis
 */
function calculateAdditionalCredits(additionalAICredits: any[]): number {
  return additionalAICredits.reduce((total, credit) => total + (credit.quantity - credit.used), 0);
}

/**
 * Limpa o cache de validação para um usuário específico
 */
export async function clearValidationCache(userId: string, contactPhone?: string): Promise<void> {
  try {
    const cacheKey = contactPhone ? `contact_validation:${userId}:${contactPhone}` : `contact_validation:${userId}:*`;

    if (contactPhone) {
      await redis.del(cacheKey);
      return;
    }

    const keys = await redis.keys(cacheKey);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Erro ao limpar cache de validação:", error);
  }
}
