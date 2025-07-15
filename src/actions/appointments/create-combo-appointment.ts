"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";

interface CreateComboAppointmentData {
  startTime: Date;
  endTime: Date;
  notes?: string;
  clientComboId: number;
  serviceId: number;
  calendarId: number;
  collaboratorId?: number;
}

export async function createComboAppointment(data: CreateComboAppointmentData) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se há saldo disponível
    const session = await prisma.clientComboSession.findFirst({
      where: {
        clientComboId: data.clientComboId,
        serviceId: data.serviceId,
      },
      include: {
        clientCombo: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!session) {
      return {
        success: false,
        error: "Sessão do pacote não encontrada",
      };
    }

    if (session.usedSessions >= session.totalSessions) {
      return {
        success: false,
        error: "Não há sessões disponíveis neste pacote",
      };
    }

    // Verificar se o pacote não expirou
    if (session.clientCombo.expiresAt && session.clientCombo.expiresAt < new Date()) {
      return {
        success: false,
        error: "Este pacote já expirou",
      };
    }

    // Buscar informações do serviço e colaborador para campos históricos
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    const collaborator = data.collaboratorId ? await prisma.collaborator.findUnique({
      where: { id: data.collaboratorId },
    }) : null;

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        comboId: data.clientComboId,
        userId: user.id,
        clientId: session.clientCombo.clientId,
        serviceId: data.serviceId,
        calendarId: data.calendarId,
        collaboratorId: data.collaboratorId,
        servicePrice: 0, // Preço já foi pago no pacote
        finalPrice: 0,
        serviceName: service?.name || "", // Campo histórico obrigatório
        collaboratorName: collaborator?.name || "", // Campo histórico obrigatório
        comboName: session.clientCombo.comboName || "", // Campo histórico obrigatório
      },
    });

    // Incrementar sessões usadas
    await prisma.clientComboSession.update({
      where: {
        id: session.id,
      },
      data: {
        usedSessions: session.usedSessions + 1,
      },
    });

    // Verificar se o pacote foi completamente utilizado
    const allSessions = await prisma.clientComboSession.findMany({
      where: {
        clientComboId: data.clientComboId,
      },
    });

    const allCompleted = allSessions.every((s) => s.usedSessions >= s.totalSessions);

    if (allCompleted) {
      await prisma.clientCombo.update({
        where: {
          id: data.clientComboId,
        },
        data: {
          status: "completed",
        },
      });
    }

    revalidatePath("/appointments");
    revalidatePath("/clients");

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("[CREATE_COMBO_APPOINTMENT_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao criar o agendamento",
    };
  }
}
