"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function getAppointmentsByCalendarAndDate(
  calendarId: string,
  date: Date
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      } as const;
    }

    const calendar = await prisma.calendar.findFirst({
      where: {
        id: calendarId,
        userId,
      },
    });

    if (!calendar) {
      return {
        success: false,
        error: "Calendário não encontrado",
      } as const;
    }

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const appointments = await prisma.appointment.findMany({
      where: {
        calendarId,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: "scheduled",
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return {
      success: true,
      data: appointments,
    } as const;
  } catch (error) {
    console.error("[GET_APPOINTMENTS]", error);
    return {
      success: false,
      error: "Falha ao buscar agendamentos",
    } as const;
  }
}
