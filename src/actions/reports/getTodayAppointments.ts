"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Appointment } from "@prisma/client";
import moment from "moment";
import { unstable_cache } from "next/cache";

type AppointmentWithRelations = Appointment & {
  client: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  collaborator: { id: string; name: string } | null;
};

type TodayAppointmentsSuccess = {
  success: true;
  data: {
    appointments: AppointmentWithRelations[];
    totalPages: number;
  };
};

type TodayAppointmentsError = {
  success: false;
  error: string;
};

export async function getTodayAppointments(): Promise<
  TodayAppointmentsSuccess | TodayAppointmentsError
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const today = moment().startOf("day").toDate();
    const tomorrow = moment().add(1, "day").startOf("day").toDate();

    const cachedFetch = unstable_cache(
      async (): Promise<TodayAppointmentsSuccess> => {
        const appointments = await prisma.appointment.findMany({
          where: {
            userId,
            startTime: {
              gte: today,
              lt: tomorrow,
            },
          },
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            calendar: {
              select: {
                collaborator: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { startTime: "asc" },
        });

        const formattedAppointments: AppointmentWithRelations[] =
          appointments.map((appointment) => ({
            ...appointment,
            client: appointment.client
              ? {
                  id: appointment.client.id,
                  name: appointment.client.fullName,
                }
              : null,
            service: appointment.service
              ? {
                  id: appointment.service.id,
                  name: appointment.service.name,
                }
              : null,
            collaborator: appointment.calendar?.collaborator
              ? {
                  id: appointment.calendar.collaborator.id,
                  name: appointment.calendar.collaborator.name,
                }
              : null,
          }));

        return {
          success: true as const,
          data: {
            appointments: formattedAppointments,
            totalPages: 1,
          },
        };
      },
      [`today-appointments-${userId}-${today.toISOString().split("T")[0]}`],
      { revalidate: 60 * 5, tags: ["appointments"] }
    );

    return cachedFetch();
  } catch (error) {
    console.error("Erro ao buscar agendamentos de hoje:", error);
    return { success: false, error: "Falha ao buscar agendamentos de hoje" };
  }
}
