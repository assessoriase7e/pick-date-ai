"use server";

import { isLifetimeUser } from "./lifetime-user";
import { Subscription } from "@prisma/client";

/**
 * Obtém o limite de créditos de IA baseado na assinatura do usuário
 * @param subscription Objeto de assinatura do usuário
 * @param checkLifetime Se true, verifica se o usuário é lifetime
 * @returns Número de créditos permitidos (Infinity para usuários lifetime)
 */
export async function getAICreditsLimit(
  subscription: Subscription | null | undefined,
  checkLifetime: boolean = true
): Promise<number> {
  // Verificar se é usuário lifetime primeiro
  if (checkLifetime && await isLifetimeUser()) {
    return Infinity;
  }

  if (!subscription || subscription.status !== "active") {
    return 0; // Sem assinatura = sem créditos
  }

  const { stripePriceId } = subscription;

  // Verificar pelos IDs dos produtos de IA
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!) {
    return 100;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!) {
    return 200;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!) {
    return 300;
  }

  return 0; // Outros planos não têm créditos de IA
}

/**
 * Obtém o limite de calendários baseado na assinatura do usuário
 * @param subscription Objeto de assinatura do usuário
 * @param checkLifetime Se true, verifica se o usuário é lifetime
 * @returns Número de calendários permitidos (Infinity para usuários lifetime e planos AI)
 */
export async function getCalendarLimit(
  subscription: Subscription | null | undefined,
  checkLifetime: boolean = true
): Promise<number> {
  // Verificar se é usuário lifetime primeiro
  if (checkLifetime && await isLifetimeUser()) {
    return Infinity;
  }
  
  if (!subscription || subscription.status !== "active") {
    return 3; // Plano base: 3 calendários
  }

  const { stripePriceId } = subscription;
  
  // Planos com IA não têm limite
  if ([
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
  ].includes(stripePriceId)) {
    return Infinity;
  }
  
  // Verificar se tem assinatura de calendários adicionais
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!) {
    return 13; // 3 base + 10 adicionais
  }
  
  return 3; // Plano base padrão
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
export async function hasAdditionalCalendars(subscription: Subscription | null | undefined): Promise<boolean> {
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  return subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!;
}