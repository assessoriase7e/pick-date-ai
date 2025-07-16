"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCalendarLimit } from "@/lib/calendar-limit";
import { Calendar, Subscription } from "@prisma/client";

interface CalendarLimitsResult {
  hasExcess: boolean;
  activeCalendars: Calendar[];
  excessCount: number;
  currentLimit: number;
}

/**
 * Verifica se o usuário excedeu o limite de calendários ativos
 * @returns Informações sobre o limite de calendários e excesso
 */
export async function checkCalendarLimits(): Promise<CalendarLimitsResult> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  // Buscar a assinatura do usuário
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
  });

  // Obter o limite de calendários
  const calendarLimit = await getCalendarLimit(subscription, userId);

  // Buscar calendários ativos
  const activeCalendars = await prisma.calendar.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const activeCount = activeCalendars.length;
  const excessCount = Math.max(0, activeCount - calendarLimit);
  const hasExcess = excessCount > 0;

  return {
    hasExcess,
    activeCalendars,
    excessCount,
    currentLimit: calendarLimit === Infinity ? -1 : calendarLimit, // Usar -1 para representar infinito no cliente
  };
}