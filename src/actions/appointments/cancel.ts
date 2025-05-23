"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { cancelAppointmentSchema } from "@/validators/calendar";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function cancelAppointment(
  data: z.infer<typeof cancelAppointmentSchema>,
  isPublic?: boolean
) {
  try {
    const validatedData = cancelAppointmentSchema.parse(data);

    const appointment = await prisma.appointment.findUnique({
      where: { id: validatedData.id },
      select: {
        id: true,
        userId: true,
        calendarId: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    let userId: string | null = null;

    if (isPublic) {
      const calendar = await prisma.calendar.findUnique({
        where: { id: appointment.calendarId },
        select: { userId: true },
      });

      if (!calendar) {
        return {
          success: false,
          error: "Calendário não encontrado",
        };
      }

      userId = calendar.userId;
    } else {
      const authResult = await auth();

      if (!authResult || !authResult.userId) {
        return {
          success: false,
          error: "Não autorizado",
        };
      }

      userId = authResult.userId;

      if (appointment.userId !== userId) {
        return {
          success: false,
          error: "Você não tem permissão para cancelar este agendamento",
        };
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: validatedData.id },
      data: {
        status: "cancelled",
      },
      include: {
        client: {
          select: {
            fullName: true,
            phone: true,
            birthDate: true,
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
    });

    revalidatePath(`/calendar/day?calendarId=${appointment.calendarId}`);
    revalidatePath("/reports");
    revalidatePath("/appointments");
    revalidatePath(`/shared-calendar/${appointment.calendarId}`);

    return {
      success: true,
      data: updatedAppointment,
    };
  } catch (error) {
    console.error("[APPOINTMENT_CANCEL]", error);
    return {
      success: false,
      error: "Falha ao cancelar agendamento",
    };
  }
}
