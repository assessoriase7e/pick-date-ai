"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getCalendarCollaborator(calendarId: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      include: { 
        collaborator: {
          select: {
            id: true,
            name: true,
            profession: true,
            workingHours: true
          }
        } 
      },
    });

    if (!calendar) {
      return {
        success: false,
        error: "Calendário não encontrado",
      };
    }

    return {
      success: true,
      data: {
        collaboratorId: calendar.collaboratorId,
        collaborator: calendar.collaborator,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar calendário:", error);
    return {
      success: false,
      error: "Falha ao buscar dados do calendário",
    };
  }
}