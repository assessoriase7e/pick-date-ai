"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendWhatsAppMessage } from "../evolution/send-whatsapp-message";

type SendNotificationParams = {
  date?: Date;
  message: string;
  appointmentIds?: number[];
};

export async function sendAppointmentNotifications(params: SendNotificationParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const { date, message, appointmentIds } = params;

    // Buscar agendamentos com base nos parâmetros fornecidos
    const appointments = appointmentIds
      ? await prisma.appointment.findMany({
          where: {
            userId,
            id: { in: appointmentIds },
            status: "scheduled",
          },
          include: {
            client: true,
          },
        })
      : await prisma.appointment.findMany({
          where: {
            userId,
            startTime: {
              gte: date ? new Date(date) : new Date(),
              lt: date
                ? new Date(new Date(date).setHours(23, 59, 59, 999))
                : new Date(new Date().setHours(23, 59, 59, 999)),
            },
            status: "scheduled",
          },
          include: {
            client: true,
          },
        });

    if (appointments.length === 0) {
      return {
        success: false,
        error: "Nenhum agendamento encontrado para a data selecionada",
        count: 0,
      };
    }

    // Enviar mensagens para cada agendamento
    let successCount = 0;

    for (const appointment of appointments) {
      if (!appointment.client?.phone) continue;

      // Substituir variáveis na mensagem
      const formattedDate = format(new Date(appointment.startTime), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });

      const personalizedMessage = message
        .replace(/{{nome_cliente}}/g, appointment.client.fullName)
        .replace(/{{data}}/g, formattedDate);

      // Enviar mensagem via WhatsApp
      const result = await sendWhatsAppMessage({
        to: appointment.client.phone,
        message: personalizedMessage,
      });

      if (result.success) {
        successCount++;
      }
    }

    return {
      success: true,
      count: successCount,
    };
  } catch (error) {
    console.error("Erro ao enviar notificações:", error);
    return {
      success: false,
      error: "Erro ao enviar notificações",
      count: 0,
    };
  }
}
