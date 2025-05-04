import { AppointmentFullData } from "@/types/calendar";
import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

type GetAppointmentsByMonthReturn = {
  success: boolean;
  data?: AppointmentFullData[] | null;
  error?: string;
};

export async function getAppointmentsByMonth(
  date: Date,
  calendarId: string,
  requireAuth: boolean = true
): Promise<GetAppointmentsByMonthReturn> {
  let userId: string | undefined = undefined;
  if (requireAuth) {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }
    userId = authUserId;
  }

  async function fetchAppointments(
    userId: string | undefined,
    dateIso: string,
    calendarId: string
  ): Promise<GetAppointmentsByMonthReturn> {
    try {
      const start = startOfMonth(new Date(dateIso));
      const end = endOfMonth(new Date(dateIso));

      const whereClause: any = {
        startTime: { gte: start, lte: end },
      };

      if (calendarId && calendarId.trim() !== "") {
        whereClause.calendarId = calendarId;
      } else {
        return {
          success: false,
          error: "ID do calendário inválido",
        };
      }

      if (userId && userId.trim() !== "") {
        whereClause.userId = userId;
      }

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: { client: true, service: true },
        orderBy: { startTime: "asc" },
      });

      return { success: true, data: appointments };
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return {
        success: false,
        error: "Não foi possível carregar os agendamentos",
      };
    }
  }

  return fetchAppointments(userId, date.toISOString(), calendarId);
}
