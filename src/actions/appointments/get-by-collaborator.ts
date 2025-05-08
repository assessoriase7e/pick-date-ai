"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";

type GetAppointmentsByCollaboratorResponse =
  | {
      success: true;
      data: any[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

export async function getAppointmentsByCollaborator(
  collaboratorId: string,
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

    // Buscar calendários associados ao colaborador
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

    // Buscar agendamentos dos calendários do colaborador
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

    // Formatar os dados para a tabela
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      clientName: appointment.client?.fullName || "Cliente não informado",
      serviceName: appointment.service?.name || "Serviço não informado",
      price: appointment.finalPrice || appointment.servicePrice || 0,
      date: appointment.startTime,
      formattedDate: format(appointment.startTime, "dd/MM/yyyy HH:mm"),
    }));

    return {
      success: true,
      data: formattedAppointments,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos do colaborador:", error);
    return {
      success: false,
      error: "Falha ao buscar agendamentos do colaborador",
    };
  }
}