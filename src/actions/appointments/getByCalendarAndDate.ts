"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";
import { unstable_cache } from "next/cache";

export async function getAppointmentsByCalendarAndDate(
  calendarId: string,
  date: Date
) {
  return unstable_cache(
    async () => {
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
        };
      } catch (error) {
        console.error("[GET_APPOINTMENTS]", error);
        return {
          success: false,
          error: "Falha ao buscar agendamentos",
        };
      }
    },
    [`appointments-calendar-date-${calendarId}-${date.toISOString()}`],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["appointments", "clients", "services", "calendar"],
    }
  )();
}
