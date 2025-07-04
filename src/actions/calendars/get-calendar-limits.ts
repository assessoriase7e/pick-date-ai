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
function getCalendarLimit(subscription: any): number {
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
          where: { isActive: true }
        }
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
      calendarLimit = getCalendarLimit(user.subscription);
      
      // Verificar se é plano AI
      isAiPlan = [
        process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
        process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
        process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
      ].includes(user.subscription?.stripePriceId || '');
      
      // Verificar se tem calendários adicionais
      hasAdditionalCalendars = 
        user.subscription?.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!;
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
      limit: 3,
      current: 0,
      canCreateMore: true,
      isAiPlan: false,
      hasAdditionalCalendars: false,
    };
  }
}