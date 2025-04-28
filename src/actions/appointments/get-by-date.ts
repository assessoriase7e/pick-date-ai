"use server";

import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function getAppointmentsByDate(date: Date) {
  try {
    const start = startOfDay(date);
    const end = endOfDay(date);

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: {
          select: {
            fullName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return {
      success: false,
      error: "Não foi possível carregar os agendamentos",
    };
  }
}