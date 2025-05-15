"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { updateAppointmentSchema } from "@/validators/calendar";
import { z } from "zod";
import { Appointment } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateAppointment(
  id: string,
  data: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "userId">
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!currentAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        calendarId: currentAppointment.calendarId,
        id: { not: id },
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
        finalPrice: validatedData.finalPrice,
      },
      include: {
        client: true,
        service: true,
      },
    });

    revalidatePath("/calendar");

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
