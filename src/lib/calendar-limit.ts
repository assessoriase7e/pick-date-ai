"use server";

import { prisma } from "@/lib/db";
import { isLifetimeUser } from "./lifetime-user";
import { Subscription } from "@prisma/client";

/**
 * Obtém o limite de calendários baseado na assinatura do usuário
 * @param subscription Objeto de assinatura do usuário
 * @param userId ID do usuário para verificar calendários adicionais
 * @returns Número de calendários permitidos
 */
export async function getCalendarLimit(subscription: Subscription | null | undefined, userId: string): Promise<number> {
  // Verificar se é usuário lifetime primeiro
  if (await isLifetimeUser()) {
    return Infinity;
  }

  if (!subscription || subscription.status !== "active") {
    return 1; // Plano base: 1 calendário (alterado de 3 para 1)
  }

  // Buscar calendários adicionais ativos
  const additionalCalendars = await prisma.additionalCalendar.count({
    where: {
      userId,
      active: true,
    },
  });

  return 1 + additionalCalendars;
}

/**
 * Verifica se o usuário pode ativar mais calendários
 * @param userId ID do usuário
 * @param subscription Objeto de assinatura do usuário
 * @returns true se o usuário pode ativar mais calendários
 */
export async function canActivateMoreCalendars(
  userId: string,
  subscription: Subscription | null | undefined
): Promise<boolean> {
  // Obter o limite de calendários
  const calendarLimit = await getCalendarLimit(subscription, userId);

  // Contar calendários ativos
  const activeCalendarsCount = await prisma.calendar.count({
    where: {
      userId,
      isActive: true,
    },
  });

  // Verificar se o usuário pode ativar mais calendários
  return activeCalendarsCount < calendarLimit;
}
