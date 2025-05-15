"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { cancelAppointmentSchema } from "@/validators/calendar";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function cancelAppointment(
  data: z.infer<typeof cancelAppointmentSchema>
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const validatedData = cancelAppointmentSchema.parse(data);

    const appointment = await prisma.appointment.update({
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

    

    revalidatePath(`/calendar/day?calendarId${appointment.calendarId}`);
    revalidatePath("/reports");

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("[APPOINTMENT_CANCEL]", error);
    return {
      success: false,
      error: "Falha ao cancelar agendamento",
    };
  }
}
