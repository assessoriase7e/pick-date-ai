"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteAppointment(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        calendar: {
          userId,
        },
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath("/calendar");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return {
      success: false,
      error: "Falha ao excluir agendamento",
    };
  }
}
