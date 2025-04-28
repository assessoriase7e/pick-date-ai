"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { calendarSchema } from "@/validators/calendar";

// Accept just the name parameter
export async function createCalendar({ name }: { name: string }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Add the userId to the data before validation
    const validatedData = calendarSchema.parse({
      name,
      userId,
    });

    const calendar = await prisma.calendar.create({
      data: validatedData,
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

    console.error("[CALENDAR_CREATE]", error);
    return {
      success: false,
      error: "Falha ao criar calendário",
    };
  }
}
