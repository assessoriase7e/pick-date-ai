"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getAppointmentsByCalendar(calendarId: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
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
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        calendarId,
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
    };
  } catch (error) {
    console.error("[GET_APPOINTMENTS_BY_CALENDAR]", error);
    return {
      success: false,
      error: "Falha ao buscar agendamentos",
    };
  }
}
