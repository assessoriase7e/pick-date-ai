"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Appointment } from "@prisma/client";
import { unstable_cache } from "next/cache";

type AppointmentWithRelations = Appointment & {
  client: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  collaborator: { id: string; name: string } | null;
};

type AppointmentsByDateSuccess = {
  success: true;
  data: {
    appointments: AppointmentWithRelations[];
    totalPages: number;
  };
};

type AppointmentsByDateError = {
  success: false;
  error: string;
};

export async function getAppointmentsByDate(
  from: Date,
  to?: Date,
  page: number = 1,
  limit: number = 10
): Promise<AppointmentsByDateSuccess | AppointmentsByDateError> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const whereClause: any = {
      userId,
      startTime: { gte: from }
    };

    if (to) {
      whereClause.startTime.lte = to;
    }

    const skip = (page - 1) * limit;

    const cachedFetch = unstable_cache(
      async (): Promise<AppointmentsByDateSuccess> => {
        const [appointments, total] = await Promise.all([
          prisma.appointment.findMany({
            where: whereClause,
            include: {
              client: {
                select: {
                  id: true,
                  fullName: true,
                }
              },
              service: {
                select: {
                  id: true,
                  name: true,
                }
              },
              calendar: {
                select: {
                  collaborator: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                }
              }
            },
            orderBy: { startTime: "asc" },
            skip,
            take: limit
          }),
          prisma.appointment.count({
            where: whereClause
          })
        ]);

        const formattedAppointments: AppointmentWithRelations[] = appointments.map(appointment => ({
          ...appointment,
          client: appointment.client ? {
            id: appointment.client.id,
            name: appointment.client.fullName
          } : null,
          service: appointment.service ? {
            id: appointment.service.id,
            name: appointment.service.name
          } : null,
          collaborator: appointment.calendar?.collaborator ? {
            id: appointment.calendar.collaborator.id,
            name: appointment.calendar.collaborator.name
          } : null
        }));

        return {
          success: true,
          data: {
            appointments: formattedAppointments,
            totalPages: Math.ceil(total / limit)
          }
        };
      },
      [`appointments-by-date-${userId}-${from.toISOString()}-${to?.toISOString() || 'none'}-${page}-${limit}`],
      { revalidate: 60 * 5, tags: ["appointments"] }
    );

    return cachedFetch();
  } catch (error) {
    console.error("Erro ao buscar agendamentos por data:", error);
    return { success: false, error: "Falha ao buscar agendamentos por data" };
  }
}