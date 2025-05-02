"use server";

import { prisma } from "@/lib/db";
import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { unstable_cache } from "next/cache";

type GetAppointmentsByMonthReturn = {
  success: boolean;
  data?: AppointmentFullData[] | null;
  error?: string;
};

export async function getAppointmentsByMonth(
  date: Date,
  calendarId: string
): Promise<GetAppointmentsByMonthReturn> {
  // 1. Autentique **antes** do cache
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  async function fetchAppointments(
    userId: string,
    dateIso: string,
    calendarId: string
  ): Promise<GetAppointmentsByMonthReturn> {
    try {
      const start = startOfMonth(new Date(dateIso));
      const end = endOfMonth(new Date(dateIso));

      const appointments = await prisma.appointment.findMany({
        where: {
          AND: [
            { startTime: { gte: start, lte: end } },
            { userId },
            { calendarId },
          ],
        },
        include: { client: true, service: true },
        orderBy: { startTime: "asc" },
      });

      return { success: true, data: appointments };
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return {
        success: false,
        error: "Não foi possível carregar os agendamentos",
      };
    }
  }

  const cachedFetch = unstable_cache(
    fetchAppointments,
    // chave do cache incorporando todos os valores dinâmicos
    [`appointments-month-${date.toISOString()}-${calendarId}-${userId}`],
    {
      revalidate: 60 * 5,
      tags: ["appointments", "clients", "services", "calendar"],
    }
  );

  return cachedFetch(userId, date.toISOString(), calendarId);
}
