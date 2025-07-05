"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { invalidateSubscriptionCache } from "@/utils/subscription-cache";
import { revalidatePath } from "next/cache";

export async function cancelAdditionalCalendar(additionalCalendarId: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Buscar o calendário adicional
    const additionalCalendar = await prisma.additionalCalendar.findFirst({
      where: {
        id: additionalCalendarId,
        userId,
        active: true,
      },
    });

    if (!additionalCalendar) {
      throw new Error("Calendário adicional não encontrado");
    }

    // Cancelar no Stripe
    if (additionalCalendar.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(additionalCalendar.stripeSubscriptionId);
    }

    // Desativar no banco de dados
    await prisma.additionalCalendar.update({
      where: { id: additionalCalendarId },
      data: { active: false },
    });

    // Verificar se excede o limite e redirecionar para gerenciamento de calendários
    const hasExcess = await checkCalendarExcess(userId);

    // Invalidar cache
    await invalidateSubscriptionCache(userId);
    revalidatePath("/settings");
    revalidatePath("/calendar");

    return {
      success: true,
      message: "Calendário adicional cancelado com sucesso",
      hasExcess,
    };
  } catch (error) {
    console.error("Error cancelling additional calendar:", error);
    throw error;
  }
}

// Nova função para verificar excesso de calendários sem desativar
async function checkCalendarExcess(userId: string): Promise<boolean> {
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

  if (!user) return false;

  // Calcular limite
  const baseLimit = 3;
  const additionalCalendarsCount = user.additionalCalendars.length;
  const newLimit = baseLimit + additionalCalendarsCount;

  const activeCalendars = user.calendars;
  const excessCount = activeCalendars.length - newLimit;

  return excessCount > 0;
}

// Remover a função checkAndDeactivateExcessCalendars que desativava automaticamente
async function checkAndDeactivateExcessCalendars(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      calendars: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" }, // Manter os mais recentes ativos
      },
      additionalCalendars: {
        where: { active: true },
      },
    },
  });

  if (!user) return;

  // Calcular novo limite
  const baseLimit = 3;
  const additionalCalendarsCount = user.additionalCalendars.length;
  const newLimit = baseLimit + additionalCalendarsCount;

  const activeCalendars = user.calendars;
  const excessCount = activeCalendars.length - newLimit;

  if (excessCount > 0) {
    // Desativar os calendários mais antigos
    const calendarsToDeactivate = activeCalendars
      .slice(-excessCount) // Pegar os mais antigos
      .map((cal) => cal.id);

    await prisma.calendar.updateMany({
      where: {
        id: { in: calendarsToDeactivate },
        userId,
      },
      data: { isActive: false },
    });
  }
}
