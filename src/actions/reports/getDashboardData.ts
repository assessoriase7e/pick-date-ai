"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import moment from "moment";

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

export const getDashboardData = async (): Promise<
  DashboardDataSuccess | DashboardDataError
> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    const today = moment().startOf("day").toDate();
    const tomorrow = moment().add(1, "day").startOf("day").toDate();

    const clientCount = await prisma.client.count({ where: { userId } });

    const completedAppointmentsCount = await prisma.appointment.count({
      where: {
        userId,
        startTime: { lt: today },
        status: "scheduled",
      },
    });

    const futureAppointmentsCount = await prisma.appointment.count({
      where: {
        userId,
        startTime: { gte: moment(today).add(1, "day").toDate() },
        status: "scheduled",
      },
    });

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        userId,
        startTime: { gte: today, lt: tomorrow },
        status: "scheduled",
      },
      include: {
        service: {
          select: { price: true },
        },
      },
    });

    const todayRevenue = todayAppointments.reduce(
      (total, appointment) =>
        total +
        (appointment.finalPrice ||
          appointment.servicePrice ||
          appointment.service?.price ||
          0),
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
};
