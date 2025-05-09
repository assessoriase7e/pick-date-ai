"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import moment from "moment";

type AppointmentData = {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  collaboratorName: string;
};

type ScheduledAppointmentsResult =
  | { success: true; data: AppointmentData[] }
  | { success: false; error: string };

export const getScheduledAppointments = async (
  from: Date,
  to: Date
): Promise<ScheduledAppointmentsResult> => {
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
        client: {
          select: {
            fullName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        calendar: {
          select: {
            collaborator: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      clientName: appointment.client?.fullName || "Cliente não encontrado",
      serviceName: appointment.service?.name || "Serviço não encontrado",
      date: moment(appointment.startTime).format("DD/MM/YYYY"),
      time: moment(appointment.startTime).format("HH:mm"),
      collaboratorName:
        appointment.calendar?.collaborator?.name ||
        "Profissional não encontrado",
    }));

    return { success: true, data: formattedAppointments };
  } catch (error) {
    console.error("Erro ao buscar agendamentos agendados:", error);
    return {
      success: false,
      error: "Erro interno ao buscar agendamentos agendados",
    };
  }
};
