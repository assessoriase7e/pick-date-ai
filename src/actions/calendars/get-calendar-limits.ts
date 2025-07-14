"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isLifetimeUser } from "@/lib/lifetime-user";

interface CalendarLimitsData {
  limit: number;
  current: number;
  canCreateMore: boolean;
  isAiPlan: boolean;
  hasAdditionalCalendars: boolean;
}

// Função para determinar o limite de calendários baseado no plano
async function getCalendarLimit(subscription: any, userId: string): Promise<number> {
  // Verificar se o usuário está em período de teste
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

  if (!subscription || subscription.status !== "active") {
    return 1; // Plano base: 1 calendário (alterado de 3 para 1)
  }

  const { stripePriceId } = subscription;

  // Planos com IA não têm limite
  if (
    [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100!,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200!,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!,
    ].includes(stripePriceId)
  ) {
    return Infinity;
  }

  // Buscar calendários adicionais ativos
  const additionalCalendars = await prisma.additionalCalendar.count({
    where: {
      userId,
      active: true,
    },
  });

  return 3 + additionalCalendars; // 3 base + calendários adicionais
}

export async function getCalendarLimits(): Promise<CalendarLimitsData> {
  try {
    const { userId } = await auth();

    if (!userId) {
      // Fallback para usuários não autenticados
      return {
        limit: 3,
        current: 0,
        canCreateMore: false,
        isAiPlan: false,
        hasAdditionalCalendars: false,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        calendars: {
          where: { isActive: true },
        },
        additionalCalendars: {
          where: { active: true },
        },
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se é usuário lifetime
    const clerkUser = await currentUser();
    const isLifetime = clerkUser ? await isLifetimeUser() : false;

    // Número de calendários ativos
    const activeCalendarsCount = user.calendars.length;

    // Determinar limite baseado no plano ou status lifetime
    let calendarLimit: number;
    let isAiPlan = false;
    let hasAdditionalCalendars = false;

    if (isLifetime) {
      calendarLimit = Infinity;
      isAiPlan = true;
    } else {
      calendarLimit = await getCalendarLimit(user.subscription, userId);

      // Verificar se é plano AI
      isAiPlan = [
        process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100!,
        process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200!,
        process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!,
      ].includes(user.subscription?.stripePriceId || "");

      // Verificar se tem calendários adicionais
      hasAdditionalCalendars = user.additionalCalendars.length > 0;
    }

    return {
      limit: calendarLimit,
      current: activeCalendarsCount,
      canCreateMore: activeCalendarsCount < calendarLimit,
      isAiPlan,
      hasAdditionalCalendars,
    };
  } catch (error) {
    console.error("[GET_CALENDAR_LIMITS]", error);

    // Fallback em caso de erro
    return {
      limit: 1, // Alterado de 3 para 1
      current: 0,
      canCreateMore: true,
      isAiPlan: false,
      hasAdditionalCalendars: false,
    };
  }
}
