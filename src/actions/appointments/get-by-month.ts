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
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }
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
        calendarId,
      };
      if (userId) {
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
