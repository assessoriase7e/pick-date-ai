"use server";
import { prisma } from "@/lib/db";

export async function getAppointmentById(id: number) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return {
      success: false,
      error: "Não foi possível carregar o agendamento",
    };
  }
}
