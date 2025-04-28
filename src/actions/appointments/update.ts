"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { updateAppointmentSchema } from "@/validators/calendar";
import { z } from "zod";

export async function updateAppointment(
  id: string,
  data: Omit<z.infer<typeof updateAppointmentSchema>, "id">
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Buscar o agendamento atual para obter o calendarId
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!currentAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar se já existe outro agendamento no mesmo horário para este calendário
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        calendarId: currentAppointment.calendarId,
        id: { not: id }, // Excluir o agendamento atual da verificação
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
        status: "scheduled",
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        error: "Já existe um agendamento neste horário",
      };
    }

    const validatedData = updateAppointmentSchema
      .omit({ id: true })
      .parse(data);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        notes: validatedData.notes,
      },
      include: {
        client: true,
        service: true,
      },
    });

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("[APPOINTMENT_UPDATE]", error);
    return {
      success: false,
      error: "Falha ao atualizar agendamento",
    };
  }
}
