"use server";

import { prisma } from "@/lib/db";
import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";
import { unstable_cache } from "next/cache";

type GetAppointmentsByDateReturn = {
  success: boolean;
  data?: AppointmentFullData[] | null;
  error?: string;
};

export async function getAppointmentsByDate(
  date: Date
): Promise<GetAppointmentsByDateReturn> {
  return unstable_cache(
    async () => {
      try {
        const { userId } = await auth();

        if (!userId) {
          return {
            success: false,
            error: "Usuário não autenticado",
          };
        }

        const start = startOfDay(date);
        const end = endOfDay(date);

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
    },
    [`appointments-date-${date.toISOString()}`],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["appointments", "clients", "services"],
    }
  )();
}
