"use server";

import { prisma } from "@/lib/db";
import { isLifetimeUser } from "./lifetime-user";
import { Subscription } from "@prisma/client";

/**
 * Obtém o limite de calendários baseado na assinatura do usuário
 * @param subscription Objeto de assinatura do usuário
 * @param checkLifetime Se true, verifica se o usuário é lifetime
 * @returns Número de calendários permitidos (Infinity para usuários lifetime e planos AI)
 */
export async function getCalendarLimit(
  subscription: Subscription | null | undefined,
  checkLifetime: boolean = true,
  userId?: string
): Promise<number> {
  // Verificar se é usuário lifetime primeiro
  if (checkLifetime && (await isLifetimeUser())) {
    return Infinity;
  }

  // Verificar se o usuário está em período de teste
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const trialEndDate = new Date(user.createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + 7); // Alterado de 3 para 7 dias
      const now = new Date();
      const isTrialActive = now < trialEndDate;

      if (isTrialActive) {
        return 1; // Limite de 1 calendário durante o período de teste (alterado de 20 para 1)
      }
    }
  }

  // Plano base: 1 calendário (alterado de 3 para 1)
  let baseLimit = 1;

  if (subscription && subscription.status === "active") {
    // Todos os planos têm o mesmo limite base
  }

  // Se não tiver userId, retorna apenas o limite base
  if (!userId) {
    return baseLimit;
  }

  // Buscar calendários adicionais ativos
  const additionalCalendars = await prisma.additionalCalendar.count({
    where: {
      userId,
      active: true,
    },
  });

  return baseLimit + additionalCalendars;
}

/**
 * Verifica se o usuário tem um plano de IA ativo
 * @param subscription Objeto de assinatura do usuário
 * @returns true se o usuário tem um plano de IA ativo
 */
export async function hasAIPlan(subscription: Subscription | null | undefined): Promise<boolean> {
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  const { stripePriceId } = subscription;

  return [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!,
  ].includes(stripePriceId);
}

/**
 * Verifica se o usuário tem assinatura de calendários adicionais
 * @param subscription Objeto de assinatura do usuário
 * @returns true se o usuário tem assinatura de calendários adicionais
 */
export async function hasAdditionalCalendars(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const count = await prisma.additionalCalendar.count({
    where: {
      userId,
      active: true,
    },
  });

  return count > 0;
}

/**
 * Verifica se o usuário tem o pacote adicional de IA
 * @param subscription Objeto de assinatura do usuário
 * @returns true se o usuário tem o pacote adicional de IA
 */
export async function hasAdditionalAI(subscription: Subscription | null | undefined): Promise<boolean> {
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  return subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!;
}
