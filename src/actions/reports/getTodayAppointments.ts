"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Appointment } from "@prisma/client";

type AppointmentWithRelations = Appointment & {
  client: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  collaborator: { id: string; name: string } | null;
};

type TodayAppointmentsSuccess = {
  success: true;
  data: AppointmentWithRelations[];
};

type TodayAppointmentsError = {
  success: false;
  error: string;
};

export async function getTodayAppointments(): Promise<
  TodayAppointmentsSuccess | TodayAppointmentsError
> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
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

    // Transform the data to match AppointmentWithRelations type
    const formattedAppointments: AppointmentWithRelations[] = appointments.map(
      (appointment) => ({
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
      })
    );

    return {
      success: true,
      data: formattedAppointments,
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos de hoje:", error);
    return { success: false, error: "Falha ao buscar agendamentos de hoje" };
  }
}
