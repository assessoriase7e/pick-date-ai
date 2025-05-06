"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function deleteCalendar({ id }: { id: string }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const existingCalendar = await prisma.calendar.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCalendar) {
      return {
        success: false,
        error: "Calendário não encontrado",
      };
    }

    await prisma.calendar.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[CALENDAR_DELETE]", error);
    return {
      success: false,
      error: "Falha ao excluir calendário",
    };
  }
}
