"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCalendarLimits } from "./get-calendar-limits";
import { Calendar } from "@prisma/client";

export interface ExcessCalendarsData {
  hasExcess: boolean;
  excessCount: number;
  activeCalendars: Calendar[];
  currentLimit: number;
}

export async function checkExcessCalendars(): Promise<ExcessCalendarsData> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const limits = await getCalendarLimits();

    const activeCalendars = await prisma.calendar.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const excessCount = Math.max(0, activeCalendars.length - limits.limit);

    return {
      hasExcess: excessCount > 0,
      excessCount,
      activeCalendars,
      currentLimit: limits.limit,
    };
  } catch (error) {
    console.error("Error checking excess calendars:", error);
    throw error;
  }
}
