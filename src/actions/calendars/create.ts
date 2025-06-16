"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function createCalendar({
  name,
  collaboratorId,
  accessCode,
}: {
  name: string;
  collaboratorId?: number;
  accessCode?: string | null;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Buscar informações do usuário e assinatura
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
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    const activeCalendarsCount = user.calendars.length;
    
    // Verificar limite baseado no plano
    const calendarLimit = getCalendarLimit(user.subscription);
    
    if (activeCalendarsCount >= calendarLimit) {
      return {
        success: false,
        error: "CALENDAR_LIMIT_EXCEEDED",
        limit: calendarLimit,
        current: activeCalendarsCount,
      };
    }

    const calendar = await prisma.calendar.create({
      data: {
        name,
        userId,
        collaboratorId,
        accessCode,
      },
    });

    revalidatePath("/calendar");

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
    // Aqui você pode implementar lógica para diferentes quantidades
    // Por enquanto, vamos assumir que cada assinatura adiciona 10 calendários
    return 13; // 3 base + 10 adicionais
  }
  
  return 3; // Plano base padrão
}
