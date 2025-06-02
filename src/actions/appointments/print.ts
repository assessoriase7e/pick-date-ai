"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getPrintData(appointmentId: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado"
      };
    }

    // Buscar dados do agendamento
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId,
      },
      include: {
        client: true,
        service: true,
        collaborator: true,
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Agendamento não encontrado"
      };
    }

    // Buscar impressoras ativas que não excluem este serviço
    const printers = await prisma.printer.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        excludedServices: {
          where: {
            serviceId: appointment.serviceId,
          },
        },
      },
    });

    // Filtrar impressoras disponíveis
    const availablePrinters = printers.filter(
      (printer) => printer.excludedServices.length === 0
    );

    if (availablePrinters.length === 0) {
      return {
        success: true,
        message: "Nenhuma impressora disponível para este serviço",
        printers: [],
        printData: null
      };
    }

    // Buscar o perfil do usuário para obter o nome da empresa
    const profile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    // Preparar dados para impressão
    const printData = {
      clientName: appointment.client?.fullName || "Cliente não informado",
      serviceName: appointment.service.name,
      startTime: appointment.startTime.toLocaleString("pt-BR"),
      endTime: appointment.endTime.toLocaleString("pt-BR"),
      collaboratorName: appointment.collaborator?.name,
      notes: appointment.notes,
      price: appointment.finalPrice,
      companyName: profile?.companyName || "", // Adicionando o nome da empresa
    };

    return {
      success: true,
      printers: availablePrinters.map((p) => p.systemPrinterName),
      printData,
    };
  } catch (error) {
    console.error("Erro ao obter dados para impressão:", error);
    return {
      success: false,
      error: "Erro interno do servidor"
    };
  }
}