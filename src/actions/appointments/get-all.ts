"use server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getAllAppointments() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        calendar: {
          userId,
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
        calendar: {
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
