"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";

interface UpdateComboAppointmentData {
  id: number;
  startTime: Date;
  endTime: Date;
  notes?: string;
  newServiceId?: number;
  calendarId: number;
  collaboratorId?: number;
}

export async function updateComboAppointment(data: UpdateComboAppointmentData) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Buscar o agendamento atual
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id: data.id },
      include: {
        client: true,
        service: true,
      },
    });

    if (!currentAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    // Verificar se é um agendamento de combo
    if (!currentAppointment.comboId) {
      return {
        success: false,
        error: "Este agendamento não está associado a um combo",
      };
    }

    // Se não houver mudança de serviço, apenas atualizar os outros campos
    if (!data.newServiceId || data.newServiceId === currentAppointment.serviceId) {
      const updatedAppointment = await prisma.appointment.update({
        where: { id: data.id },
        data: {
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes,
          collaboratorId: data.collaboratorId,
        },
      });

      revalidatePath("/appointments");
      revalidatePath("/clients");

      return {
        success: true,
        data: updatedAppointment,
      };
    }

    // Caso haja mudança de serviço, precisamos ajustar os créditos
    // 1. Devolver o crédito do serviço anterior
    const previousSession = await prisma.clientComboSession.findFirst({
      where: {
        clientComboId: currentAppointment.comboId,
        serviceId: currentAppointment.serviceId,
      },
    });

    if (!previousSession) {
      return {
        success: false,
        error: "Sessão do pacote não encontrada para o serviço anterior",
      };
    }

    // 2. Verificar se há crédito disponível para o novo serviço
    const newSession = await prisma.clientComboSession.findFirst({
      where: {
        clientComboId: currentAppointment.comboId,
        serviceId: data.newServiceId,
      },
    });

    if (!newSession) {
      return {
        success: false,
        error: "Serviço não encontrado no combo",
      };
    }

    if (newSession.usedSessions >= newSession.totalSessions) {
      return {
        success: false,
        error: "Não há sessões disponíveis para este serviço no combo",
      };
    }

    // 3. Buscar informações do novo serviço para campos históricos
    const newService = await prisma.service.findUnique({
      where: { id: data.newServiceId },
    });

    const collaborator = data.collaboratorId
      ? await prisma.collaborator.findUnique({
          where: { id: data.collaboratorId },
        })
      : null;

    // 4. Iniciar uma transação para garantir a integridade dos dados
    const result = await prisma.$transaction(async (tx) => {
      // Devolver crédito do serviço anterior
      await tx.clientComboSession.update({
        where: { id: previousSession.id },
        data: {
          usedSessions: previousSession.usedSessions - 1,
        },
      });

      // Consumir crédito do novo serviço
      await tx.clientComboSession.update({
        where: { id: newSession.id },
        data: {
          usedSessions: newSession.usedSessions + 1,
        },
      });

      // Atualizar o agendamento
      const updatedAppointment = await tx.appointment.update({
        where: { id: data.id },
        data: {
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes,
          serviceId: data.newServiceId,
          collaboratorId: data.collaboratorId,
          serviceName: newService?.name || "",
          collaboratorName: collaborator?.name || "",
        },
      });

      return updatedAppointment;
    });

    // Verificar se o combo foi completamente utilizado ou se agora tem sessões disponíveis
    const allSessions = await prisma.clientComboSession.findMany({
      where: {
        clientComboId: currentAppointment.comboId,
      },
    });

    const allCompleted = allSessions.every((s) => s.usedSessions >= s.totalSessions);
    const hasAvailableSessions = allSessions.some((s) => s.usedSessions < s.totalSessions);

    // Atualizar o status do combo se necessário
    if (allCompleted) {
      await prisma.clientCombo.update({
        where: {
          id: currentAppointment.comboId,
        },
        data: {
          status: "completed",
        },
      });
    } else if (hasAvailableSessions) {
      await prisma.clientCombo.update({
        where: {
          id: currentAppointment.comboId,
        },
        data: {
          status: "active",
        },
      });
    }

    revalidatePath("/appointments");
    revalidatePath("/clients");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[UPDATE_COMBO_APPOINTMENT_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao atualizar o agendamento",
    };
  }
}