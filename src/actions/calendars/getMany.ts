"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { CalendarFullData } from "@/types/calendar";
export type ListCalendarReturnProps = {
  success: boolean;
  error?: string;
  data?: CalendarFullData[];
};

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
      include: {
        collaborator: true,
        appointments: {
          include: {
            client: true,
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      data: calendars as unknown as CalendarFullData[],
    };
  } catch (error) {
    console.error("[CALENDARS_GET_MANY]", error);
    return {
      success: false,
      error: "Falha ao buscar calendários",
    };
  }
}
