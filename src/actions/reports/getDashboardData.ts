"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import moment from "moment";
import { unstable_cache } from "next/cache";

type DashboardDataSuccess = {
  success: true;
  data: {
    clientCount: number;
    completedAppointmentsCount: number;
    futureAppointmentsCount: number;
    todayRevenue: number;
  };
};

type DashboardDataError = {
  success: false;
  error: string;
};

async function fetchDashboardData(
  userId: string
): Promise<DashboardDataSuccess | DashboardDataError> {
  try {
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Datas com moment
    const today = moment().startOf("day").toDate();
    const tomorrow = moment().add(1, "day").startOf("day").toDate();

    // Contagem de clientes
    const clientCount = await prisma.client.count({
      where: { userId },
    });

    // Agendamentos concluídos antes de hoje
    const completedAppointmentsCount = await prisma.appointment.count({
      where: {
        userId,
        startTime: { lt: today },
        status: "scheduled",
      },
    });

    // Agendamentos futuros (de hoje em diante)
    const futureAppointmentsCount = await prisma.appointment.count({
      where: {
        userId,
        startTime: { gte: today },
      },
    });

    // Agendamentos do dia
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        userId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
        status: "scheduled",
      },
      include: {
        service: {
          select: { price: true },
        },
      },
    });

    const todayRevenue = todayAppointments.reduce(
      (total, appointment) => total + (appointment.service?.price || 0),
      0
    );

    return {
      success: true,
      data: {
        clientCount,
        completedAppointmentsCount,
        futureAppointmentsCount,
        todayRevenue,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return { success: false, error: "Falha ao buscar dados do dashboard" };
  }
}

export const getDashboardData = async () => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  return unstable_cache(
    () => fetchDashboardData(userId),
    ["dashboard-data", userId],
    { revalidate: 60 * 5, tags: ["dashboard"] }
  )();
};
