"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator } from "@prisma/client";

type GetCalendarCollaboratorResponse = {
  success: boolean;
  data?: {
    collaboratorId: number | null;
    collaborator: Collaborator | null;
  } | null;
  error?: string;
};

export async function getCalendarCollaborator(
  calendarId: number,
  requireAuth: boolean = true
): Promise<GetCalendarCollaboratorResponse> {
  try {
    let userId: string | undefined = undefined;
    if (requireAuth) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }
      userId = authUserId;
    }

    // Se requireAuth for true, busca pelo calendarId e userId
    // Se for false, busca apenas pelo calendarId
    const calendar = await prisma.calendar.findFirst({
      where: requireAuth ? { id: calendarId, userId } : { id: calendarId },
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
    console.error("Erro ao buscar profissional do calendário:", error);
    return {
      success: false,
      error: "Falha ao buscar profissional do calendário",
    };
  }
}
