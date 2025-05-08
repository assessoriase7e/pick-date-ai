"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { Appointment } from "@prisma/client";

export async function createAppointment(
  data: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "userId">
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            startTime: {
              lte: data.startTime,
            },
            endTime: {
              gt: data.startTime,
            },
          },
          {
            startTime: {
              lt: data.endTime,
            },
            endTime: {
              gte: data.endTime,
            },
          },
          {
            startTime: {
              gte: data.startTime,
            },
            endTime: {
              lte: data.endTime,
            },
          },
        ],
        status: "scheduled",
        calendarId: data.calendarId,
      },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        error: "Já existe um agendamento neste horário",
      };
    }

    // Se não houver preço definido, busca o preço do serviço
    if (!data.servicePrice || !data.finalPrice) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
      });
      
      if (service) {
        data.servicePrice = data.servicePrice || service.price;
        data.finalPrice = data.finalPrice || service.price;
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        status: data.status || "scheduled",
        userId,
      },
      include: {
        client: true,
        service: true,
      },
    });

    revalidatePath("/calendar");
    revalidatePath("/reports");

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return {
      success: false,
      error: "Falha ao criar agendamento",
    };
  }
}
