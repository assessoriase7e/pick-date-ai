"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function changeAppointmentStatus(
  id: string,
  status: "scheduled" | "completed" | "cancelled"
) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    revalidatePath(`/calendar/day?calendarId${appointment.calendarId}`);

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("Erro ao alterar status do agendamento:", error);
    return {
      success: false,
      error: "Falha ao alterar status do agendamento",
    };
  }
}
