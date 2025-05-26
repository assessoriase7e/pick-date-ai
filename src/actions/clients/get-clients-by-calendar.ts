"use server";
import { prisma } from "@/lib/db";

export async function getClientsByCalendar(calendarId: number) {
  try {
    // Primeiro, buscar o calendário para obter o userId
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId }, // Aqui estava o problema, id estava undefined
      select: {
        userId: true,
      },
    });

    if (!calendar) {
      return {
        success: false,
        error: "Calendário não encontrado",
      };
    }

    // Buscar todos os clientes do usuário dono do calendário
    const clients = await prisma.client.findMany({
      where: { userId: calendar.userId },
      orderBy: { fullName: "asc" },
    });

    return {
      success: true,
      data: clients,
    };
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return {
      success: false,
      error: "Erro ao buscar clientes",
    };
  }
}
