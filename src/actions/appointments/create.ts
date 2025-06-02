"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createAppointment({
  clientId,
  serviceId,
  calendarId,
  startTime,
  endTime,
  notes,
  status,
  servicePrice,
  finalPrice,
  collaboratorId,
  isPublic,
}: {
  clientId?: number;
  serviceId: number;
  calendarId: number;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  status: string;
  servicePrice: number | null;
  finalPrice: number | null;
  collaboratorId: number | null;
  isPublic?: Boolean;
}) {
  try {
    let userId: string | null = null;

    // Se for cliente público, buscar o userId pelo calendário
    if (isPublic) {
      const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
        select: { userId: true },
      });

      if (!calendar) {
        return {
          success: false,
          error: "Calendário não encontrado",
        };
      }

      userId = calendar.userId;
    } else {
      // Caso contrário, autenticação é obrigatória
      const authResult = await auth();

      if (!authResult || !authResult.userId) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      userId = authResult.userId;
    }

    // Criar ou reutilizar cliente público
    let actualClientId = clientId ?? null;

    // Verificar conflitos de horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            startTime: {
              lte: startTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
          {
            startTime: {
              gte: startTime,
              lte: endTime,
            },
            endTime: {
              gte: startTime,
              lte: endTime,
            },
          },
        ],
        status: "scheduled",
        calendarId: calendarId,
      },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        error: "Já existe um agendamento neste horário",
      };
    }

    // Preencher preços caso estejam ausentes
    let finalServicePrice = servicePrice;
    let finalFinalPrice = finalPrice;

    if (!finalServicePrice || !finalFinalPrice) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (service) {
        finalServicePrice = finalServicePrice || service.price;
        finalFinalPrice = finalFinalPrice || service.price;
      }
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        clientId: actualClientId,
        serviceId,
        calendarId,
        startTime,
        endTime,
        notes,
        status,
        servicePrice: finalServicePrice,
        finalPrice: finalFinalPrice,
        collaboratorId,
        userId,
      },
      include: {
        client: true,
        service: true,
        collaborator: true,
      },
    });

    revalidatePath("/calendar");
    revalidatePath("/reports");
    revalidatePath("/appointments");

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
