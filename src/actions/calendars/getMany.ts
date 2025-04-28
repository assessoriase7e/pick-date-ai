"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function listCalendars() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const calendars = await prisma.calendar.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      data: calendars,
    };
  } catch (error) {
    console.error("[CALENDARS_GET_MANY]", error);
    return {
      success: false,
      error: "Falha ao buscar calendários",
    };
  }
}
