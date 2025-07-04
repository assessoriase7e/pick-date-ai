"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { getAICreditsLimit } from "@/lib/subscription-limits";

/**
 * Consome um crédito de IA, priorizando o plano base e depois os pacotes adicionais
 * @param clientPhone Telefone do cliente para registrar o uso
 * @param conversationId ID da conversa
 * @param serviceType Tipo de serviço
 * @param source Fonte da requisição
 * @returns Objeto com status do consumo
 */
export async function consumeAICredit(
  clientPhone: string,
  conversationId: string,
  serviceType: string,
  source: string
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    // Buscar usuário com informações de assinatura
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Obter limite de créditos do plano base
    const baseCreditsLimit = await getAICreditsLimit(user.subscription, true);

    // Calcular datas do mês atual
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Contar atendimentos únicos do mês atual
    const uniqueAttendancesCount = await prisma.aIUsage.groupBy({
      by: ["clientPhone"],
      where: {
        userId,
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    }).then(result => result.length);

    // Verificar se o cliente já foi atendido este mês
    const existingUsage = await prisma.aIUsage.findFirst({
      where: {
        userId,
        clientPhone,
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // Se o cliente já foi atendido este mês, não consome crédito adicional
    if (existingUsage) {
      // Registrar o uso sem consumir crédito adicional
      await prisma.aIUsage.create({
        data: {
          userId,
          clientPhone,
          conversationId,
          serviceType,
          status: "completed",
          source,
        },
      });

      return { success: true, usedAdditionalCredit: false };
    }

    // Se ainda tem créditos no plano base, usa eles
    if (uniqueAttendancesCount < baseCreditsLimit) {
      // Registrar o uso do plano base
      await prisma.aIUsage.create({
        data: {
          userId,
          clientPhone,
          conversationId,
          serviceType,
          status: "completed",
          source,
        },
      });

      return { success: true, usedAdditionalCredit: false };
    }

    // Se chegou aqui, precisa usar crédito adicional
    // Buscar pacotes adicionais disponíveis
    const additionalCredits = await prisma.additionalAICredit.findMany({
      where: {
        userId,
        active: true,
        used: { lt: prisma.additionalAICredit.fields.quantity }
      },
      orderBy: { purchaseDate: 'asc' } // Usar os mais antigos primeiro
    });

    if (additionalCredits.length === 0) {
      return { success: false, error: "Sem créditos disponíveis" };
    }

    // Usar o primeiro pacote disponível
    const creditToUse = additionalCredits[0];

    // Atualizar o pacote, incrementando o uso
    await prisma.additionalAICredit.update({
      where: { id: creditToUse.id },
      data: {
        used: { increment: 1 },
        // Se todos os créditos foram usados, desativar o pacote
        active: creditToUse.used + 1 < creditToUse.quantity
      }
    });

    // Registrar o uso
    await prisma.aIUsage.create({
      data: {
        userId,
        clientPhone,
        conversationId,
        serviceType,
        status: "completed",
        source,
      },
    });

    return { success: true, usedAdditionalCredit: true };
  } catch (error) {
    console.error("Erro ao consumir crédito de IA:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}