"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { canActivateMoreCalendars } from "@/lib/calendar-limit";

export async function updateCalendar({
  id,
  name,
  collaboratorId,
  isActive,
  accessCode,
}: {
  id: number;
  name?: string;
  collaboratorId?: number;
  isActive?: boolean;
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

    const existingCalendar = await prisma.calendar.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCalendar) {
      return {
        success: false,
        error: "Calendário não encontrado",
      };
    }

    // Verificar se está tentando ativar um calendário
    if (isActive === true && !existingCalendar.isActive) {
      // Buscar informações do usuário e assinatura
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: "Usuário não encontrado",
        };
      }

      // Verificar se o usuário pode ativar mais calendários
      const canActivate = await canActivateMoreCalendars(userId, user.subscription);

      if (!canActivate) {
        return {
          success: false,
          error: "CALENDAR_LIMIT_EXCEEDED",
        };
      }
    }

    // Sempre permitir desativar calendários (isActive === false)
    const calendar = await prisma.calendar.update({
      where: {
        id,
      },
      data: {
        name,
        collaboratorId,
        isActive,
        accessCode,
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

    console.error("[CALENDAR_UPDATE]", error);
    return {
      success: false,
      error: "Falha ao atualizar calendário",
    };
  }
}
