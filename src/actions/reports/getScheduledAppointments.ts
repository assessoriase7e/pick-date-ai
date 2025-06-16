"use server";
import { prisma } from "@/lib/db";
import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";

type ScheduledAppointmentsResult = { success: true; data: AppointmentFullData[] } | { success: false; error: string };

export const getScheduledAppointments = async (from: Date, to: Date): Promise<ScheduledAppointmentsResult> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        startTime: {
          gte: from,
          lte: to,
        },
        status: "scheduled",
      },
      include: {
        client: true,
        service: true,
        collaborator: true,
        calendar: {
          include: {
            collaborator: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { success: true, data: appointments };
  } catch (error) {
    console.error("Erro ao buscar agendamentos agendados:", error);
    return {
      success: false,
      error: "Erro interno ao buscar agendamentos agendados",
    };
  }
};
