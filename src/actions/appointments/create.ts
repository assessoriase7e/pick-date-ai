"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AppointmentData } from "../../types/calendar";

export async function createAppointment(data: AppointmentData) {
  try {
    // Verificar se já existe um agendamento no mesmo horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            startTime: {
              lte: data.startTime,
            },
            endTime: {
              gt: data.startTime,
            },
          },
          {
            startTime: {
              lt: data.endTime,
            },
            endTime: {
              gte: data.endTime,
            },
          },
          {
            startTime: {
              gte: data.startTime,
            },
            endTime: {
              lte: data.endTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        error: "Já existe um agendamento neste horário",
      };
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        status: data.status || "scheduled",
      },
    });

    revalidatePath("/calendar");

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return {
      success: false,
      error: "Falha ao criar agendamento",
    };
  }
}
