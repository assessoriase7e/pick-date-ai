"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";

type GetServicesByCalendarResponse = {
  success: boolean;
  data?: Service[];
  error?: string;
};

export async function getServicesByCalendar(
  calendarId: number,
  requireAuth: boolean = true
): Promise<GetServicesByCalendarResponse> {
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

    // Primeiro, busca o calendário para obter o collaboratorId
    const calendar = await prisma.calendar.findFirst({
      where: requireAuth ? { id: calendarId, userId } : { id: calendarId },
      select: {
        collaboratorId: true,
      },
    });

    if (!calendar) {
      return {
        success: false,
        error: "Calendário não encontrado",
      };
    }

    // Busca os serviços através da relação ServiceCollaborator
    const services = await prisma.service.findMany({
      where: {
        serviceCollaborators: {
          some: {
            collaboratorId: calendar.collaboratorId!,
          },
        },
        isActive: true,
      },
      include: {
        serviceCollaborators: true, // Incluir a relação serviceCollaborators
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("[GET_SERVICES_BY_CALENDAR]", error);
    return {
      success: false,
      error: "Falha ao buscar serviços do calendário",
    };
  }
}
