"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getBatchPrintData(appointmentIds: number[]) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    if (!appointmentIds || appointmentIds.length === 0) {
      return {
        success: false,
        error: "Nenhum agendamento selecionado",
      };
    }

    // Buscar dados dos agendamentos
    const appointments = await prisma.appointment.findMany({
      where: {
        id: {
          in: appointmentIds,
        },
        userId,
      },
      include: {
        client: true,
        service: true,
        collaborator: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    if (appointments.length === 0) {
      return {
        success: false,
        error: "Nenhum agendamento encontrado",
      };
    }

    // Buscar o perfil do usuário para obter o nome da empresa
    const profile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    // Preparar dados para impressão
    const printData = appointments.map(appointment => ({
      id: appointment.id,
      clientName: appointment.client?.fullName || "Cliente não informado",
      serviceName: appointment.service.name,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      collaboratorName: appointment.collaborator?.name,
      notes: appointment.notes,
      price: appointment.finalPrice,
      companyName: profile?.companyName || "",
    }));

    return {
      success: true,
      printData,
    };
  } catch (error) {
    console.error("Erro ao obter dados para impressão em lote:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}