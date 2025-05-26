"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { updateRagContent } from "../agents/rag/update-rag-content";

export async function deleteCalendar({ id }: { id: number }) {
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

    updateRagContent();

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
