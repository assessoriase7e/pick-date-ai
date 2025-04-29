"use server";

import { prisma } from "@/lib/db";
import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";

type GetAppointmentsByMonthReturn = {
  success: boolean;
  data?: AppointmentFullData[] | null;
  error?: string;
};

export async function getAppointmentsByMonth(
  date: Date
): Promise<GetAppointmentsByMonthReturn> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const appointments = await prisma.appointment.findMany({
      where: {
        AND: [
          {
            startTime: {
              gte: start,
              lte: end,
            },
          },
          { userId },
        ],
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
    console.error("Erro ao buscar agendamentos:", error);
    return {
      success: false,
      error: "Não foi possível carregar os agendamentos",
    };
  }
}
