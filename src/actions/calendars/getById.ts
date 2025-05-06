"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { CalendarFullData } from "@/types/calendar";

type GetCalendarByIdResponse = {
  success: boolean;
  data?: CalendarFullData;
  error?: string;
};

export async function getCalendarById(
  calendarId: string
): Promise<GetCalendarByIdResponse> {
  try {
    const cachedFetch = unstable_cache(
      async () => {
        const calendar = await prisma.calendar.findUnique({
          where: {
            id: calendarId,
          },
          include: {
            collaborator: true,
          },
        });

        if (!calendar) {
          return {
            success: false,
            error: "Calendário não encontrado",
          };
        }

        return {
          success: true,
          data: calendar as unknown as CalendarFullData,
        };
      },
      [`calendar-by-id-${calendarId}`],
      {
        revalidate: 60 * 5,
        tags: ["calendars", "collaborators"],
      }
    );

    return cachedFetch();
  } catch (error) {
    console.error("[GET_CALENDAR_BY_ID]", error);
    return {
      success: false,
      error: "Falha ao buscar o calendário",
    };
  }
}
