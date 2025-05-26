"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteAppointment(id: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

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

    await prisma.appointment.update({
      where: { id },
      data: { status: "canceled" },
    });

    revalidatePath("/calendar");
    revalidatePath("/reports");
    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return {
      success: false,
      error: "Falha ao cancelar agendamento",
    };
  }
}
