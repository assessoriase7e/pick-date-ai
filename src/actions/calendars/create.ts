"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getCalendarLimit } from "@/lib/calendar-limit";
import { revalidatePath } from "next/cache";

// Função para gerar código de acesso aleatório
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createCalendar({
  name,
  collaboratorId,
  accessCode,
}: {
  name?: string;
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

    // VERIFICAÇÃO DE LIMITE
    const currentActiveCalendars = user.calendars.length;
    const calendarLimit = await getCalendarLimit(user.subscription, userId);

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

    // Adicionar revalidação aqui
    revalidatePath("/calendar");
    revalidatePath("/");

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
