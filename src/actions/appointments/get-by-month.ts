"use server";

import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type GetAppointmentsByMonthReturn = {
  success: boolean;
  data?: AppointmentFullData[] | null;
  error?: string;
};

export async function getAppointmentsByMonth(
  date: Date,
  calendarId: number,
  requireAuth: boolean = true,
  includeCanceled: boolean = false,
  where: Prisma.AppointmentWhereInput = { status: "scheduled" }
): Promise<GetAppointmentsByMonthReturn> {
  let userId: string | undefined = undefined;
  if (requireAuth) {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }
    userId = authUserId;
  }

  try {
    const start = startOfMonth(new Date(date));
    const end = endOfMonth(new Date(date));

    const whereClause: Prisma.AppointmentWhereInput = {
      startTime: { gte: start, lte: end },
    };

    if (calendarId) {
      whereClause.calendarId = calendarId;
    } else {
      return {
        success: false,
        error: "ID do calendário inválido",
      };
    }

    if (userId && userId.trim() !== "") {
      whereClause.userId = userId;
    }

    if (!includeCanceled) {
      whereClause.status = { not: "canceled" };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        ...whereClause,
        ...where,
      },
      include: {
        client: true,
        service: true,
        calendar: {
          select: {
            collaborator: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    // Mapeia para garantir o campo collaborator no formato esperado e converter datas
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
      collaborator: appointment.calendar?.collaborator || null,
    }));

    return { success: true, data: formattedAppointments };
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return {
      success: false,
      error: "Não foi possível carregar os agendamentos",
    };
  }
}
