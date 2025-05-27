"use server";
import { prisma } from "@/lib/db";
import { CalendarWithFullCollaborator } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";

type GetCalendarByIdResponse = {
  success: boolean;
  data?: CalendarWithFullCollaborator;
  error?: string;
};

export async function getCalendarById(
  calendarId: number,
  requireAuth: boolean = true
): Promise<GetCalendarByIdResponse> {
  try {
    let userId: string | undefined = undefined;
    if (requireAuth) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        return {
          success: false,
          error: "Não autorizado",
        };
      }
      userId = authUserId;
    }

    // Se requireAuth for true, busca pelo calendarId e userId
    // Se for false, busca apenas pelo calendarId
    const calendar = await prisma.calendar.findFirst({
      where: requireAuth ? { id: calendarId, userId } : { id: calendarId },
      include: {
        collaborator: {
          include: {
            workHours: true,
          },
        },
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
      data: calendar,
    };
  } catch (error) {
    console.error("[GET_CALENDAR_BY_ID]", error);
    return {
      success: false,
      error: "Falha ao buscar o calendário",
    };
  }
}
