"use server";
import { prisma } from "@/lib/db";
import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";

type GetAppointmentsByCollaboratorResponse =
  | {
      success: true;
      data: AppointmentFullData[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

export async function getAppointmentsByCollaborator(
  collaboratorId: number,
  page: number = 1,
  limit: number = 10
): Promise<GetAppointmentsByCollaboratorResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const skip = (page - 1) * limit;

    // Buscar calendários associados ao profissional
    const calendars = await prisma.calendar.findMany({
      where: {
        collaboratorId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!calendars.length) {
      return {
        success: true,
        data: [],
        pagination: {
          totalPages: 0,
          currentPage: page,
        },
      };
    }

    const calendarIds = calendars.map((calendar) => calendar.id);

    // Buscar agendamentos dos calendários do profissional
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          calendarId: {
            in: calendarIds,
          },
          status: {
            not: "canceled",
          },
        },
        include: {
          client: true,
          service: true,
          collaborator: true,
        },
        orderBy: {
          startTime: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.appointment.count({
        where: {
          calendarId: {
            in: calendarIds,
          },
          status: {
            not: "canceled",
          },
        },
      }),
    ]);

    return {
      success: true,
      data: appointments,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos do profissional:", error);
    return {
      success: false,
      error: "Falha ao buscar agendamentos do profissional",
    };
  }
}
