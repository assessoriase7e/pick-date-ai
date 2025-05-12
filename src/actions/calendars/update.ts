"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { calendarSchema } from "@/validators/calendar";

export async function updateCalendar({
  id,
  name,
  collaboratorId,
  isActive,
}: {
  id: string;
  name: string;
  collaboratorId?: string;
  isActive?: boolean;
}) {
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

    const validatedData = calendarSchema.parse({
      name,
      userId,
      collaboratorId,
      isActive,
    });

    const calendar = await prisma.calendar.update({
      where: {
        id,
      },
      data: {
        name: validatedData.name,
        collaboratorId: validatedData.collaboratorId,
        isActive: validatedData.isActive,
      },
    });

    return {
      success: true,
      data: calendar,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("[CALENDAR_UPDATE]", error);
    return {
      success: false,
      error: "Falha ao atualizar calendário",
    };
  }
}
