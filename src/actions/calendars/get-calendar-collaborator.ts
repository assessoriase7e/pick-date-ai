"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator } from "@prisma/client";

type GetCalendarCollaboratorResponse = {
  success: boolean;
  data?: {
    collaboratorId: string | null;
    collaborator: Collaborator | null;
  } | null;
  error?: string;
};

export async function getCalendarCollaborator(
  calendarId: string
): Promise<GetCalendarCollaboratorResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const calendar = await prisma.calendar.findFirst({
      where: {
        id: calendarId,
        userId,
      },
      include: {
        collaborator: true,
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
    console.error("Erro ao buscar colaborador do calendário:", error);
    return {
      success: false,
      error: "Falha ao buscar colaborador do calendário",
    };
  }
}
