"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCalendarLimits } from "./get-calendar-limits";

export async function canActivateCalendar(): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    const limits = await getCalendarLimits();
    return limits.canCreateMore;
  } catch (error) {
    console.error("Error checking calendar activation:", error);
    return false;
  }
}