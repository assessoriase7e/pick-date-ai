"use server";

import { prisma } from "@/lib/db";
import { isLifetimeUser } from "./lifetime-user";
import { Subscription } from "@prisma/client";

/**
 * Obtém o limite de créditos de IA baseado na assinatura do usuário
 * @param subscription Objeto de assinatura do usuário
 * @param checkLifetime Se true, verifica se o usuário é lifetime
 * @param userId ID do usuário para verificar créditos adicionais
 * @returns Número de créditos permitidos (Infinity para usuários lifetime)
 */
export async function getAICreditsLimit(
  subscription: Subscription | null | undefined,
  checkLifetime: boolean = true,
  userId?: string
): Promise<number> {
  // Verificar se é usuário lifetime primeiro
  if (checkLifetime && (await isLifetimeUser())) {
    return Infinity;
  }

  let baseCredits = 0;

  if (subscription && subscription.status === "active") {
    const { stripePriceId } = subscription;

    // Verificar pelos IDs dos produtos de IA
    if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!) {
      baseCredits = 100;
    } else if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!) {
      baseCredits = 200;
    } else if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!) {
      baseCredits = 300;
    }
  }

  // Se não tiver userId, retorna apenas os créditos base
  if (!userId) {
    return baseCredits;
  }

  // Buscar créditos adicionais ativos e não totalmente utilizados
  const additionalCredits = await prisma.additionalAICredit.findMany({
    where: {
      userId,
      active: true,
      used: { lt: prisma.additionalAICredit.fields.quantity },
    },
  });

  // Calcular total de créditos adicionais disponíveis
  const totalAdditionalCredits = additionalCredits.reduce((total, credit) => {
    return total + (credit.quantity - credit.used);
  }, 0);

  return baseCredits + totalAdditionalCredits;
}

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

  // Plano base: 3 calendários
  let baseLimit = 3;

  if (subscription && subscription.status === "active") {
    const { stripePriceId } = subscription;

    // Planos com IA não têm limite
    if (
      [
        process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
        process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
        process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
      ].includes(stripePriceId)
    ) {
      return Infinity;
    }
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
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
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

  return subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_10!;
}
