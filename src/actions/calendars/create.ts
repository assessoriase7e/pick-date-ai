"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getCalendarLimits } from "./get-calendar-limits";

// Função para gerar código de acesso aleatório
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para determinar o limite de calendários baseado no plano
async function getCalendarLimit(subscription: any, userId: string): Promise<number> {
  if (!subscription || subscription.status !== "active") {
    return 3; // Plano base: 3 calendários
  }

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

  // Buscar calendários adicionais ativos
  const additionalCalendars = await prisma.additionalCalendar.count({
    where: {
      userId,
      active: true,
    },
  });

  return 3 + additionalCalendars; // 3 base + calendários adicionais
}

export async function createCalendar({
  name,
  collaboratorId,
  accessCode,
}: {
  name: string;
  collaboratorId?: number;
  accessCode?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "UNAUTHORIZED",
      };
    }

    // Buscar informações do usuário e assinatura
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        calendars: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // VERIFICAÇÃO DE LIMITE - ADICIONAR ESTA PARTE
    const currentActiveCalendars = user.calendars.length;
    const calendarLimit = await getCalendarLimit(user.subscription, userId);

    // Verificar limites antes de criar
    const limits = await getCalendarLimits();
    if (!limits.canCreateMore) {
      return {
        success: false,
        error: "CALENDAR_LIMIT_EXCEEDED",
      };
    }

    if (currentActiveCalendars >= calendarLimit) {
      return {
        success: false,
        error: "CALENDAR_LIMIT_EXCEEDED",
      };
    }

    const calendar = await prisma.calendar.create({
      data: {
        name,
        collaboratorId,
        accessCode: accessCode || generateAccessCode(),
        userId,
        isActive: true,
      },
    });

    return {
      success: true,
      data: calendar,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("[CALENDAR_CREATE]", error);
    return {
      success: false,
      error: "Falha ao criar calendário",
    };
  }
}
