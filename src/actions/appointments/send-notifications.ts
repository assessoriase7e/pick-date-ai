"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import moment from "moment";
import { waha } from "@/utils/waha";

interface SendNotificationParams {
  date: Date;
  message: string;
  instanceName?: string; // Nome da sessão WAHA
}

interface SendNotificationResponse {
  success: boolean;
  count?: number;
  error?: string;
  failedNotifications?: string[];
}

export async function sendAppointmentNotifications({
  date,
  message,
  instanceName,
}: SendNotificationParams): Promise<SendNotificationResponse> {
  try {
    const { id: userId } = await currentUser();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se há uma sessão WAHA configurada
    let wahaSession;
    if (instanceName) {
      wahaSession = await prisma.wahaInstance.findFirst({
        where: {
          name: instanceName,
          userId,
        },
      });
    } else {
      wahaSession = await prisma.wahaInstance.findFirst({
        where: {
          userId,
          status: "WORKING", // Status ativo no WAHA
        },
      });
    }

    if (!wahaSession) {
      return {
        success: false,
        error: "Nenhuma sessão WAHA ativa encontrada. Configure uma sessão na seção Agentes.",
      };
    }

    // Buscar agendamentos do dia selecionado (exceto cancelados)
    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "cancelled", // Excluir cancelados
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        collaborator: {
          select: {
            name: true,
          },
        },
      },
    });

    if (appointments.length === 0) {
      return {
        success: false,
        error: "Nenhum agendamento encontrado para a data selecionada",
      };
    }

    // Processar mensagens personalizadas
    const processedNotifications = appointments.map((appointment) => {
      let personalizedMessage = message;

      // Substituir variáveis
      personalizedMessage = personalizedMessage.replace(/{{nome_cliente}}/g, appointment.client?.fullName || "Cliente");

      personalizedMessage = personalizedMessage.replace(
        /{{data}}/g,
        format(appointment.startTime, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
          locale: ptBR,
        })
      );

      return {
        appointmentId: appointment.id,
        clientName: appointment.client?.fullName || "Cliente",
        clientPhone: appointment.client?.phone,
        message: personalizedMessage,
        appointmentDate: appointment.startTime,
      };
    });

    // Enviar notificações via WAHA API
    const wahaApi = waha();
    const failedNotifications: string[] = [];
    let successCount = 0;

    for (const notification of processedNotifications) {
      if (!notification.clientPhone) {
        console.warn(`Cliente ${notification.clientName} não possui telefone cadastrado`);
        failedNotifications.push(`${notification.clientName} (sem telefone)`);
        continue;
      }

      try {
        // Formatar número para o padrão do WAHA (formato @c.us)
        const formattedPhone = notification.clientPhone.replace(/\D/g, "");
        const chatId = formattedPhone.startsWith("55") ? `${formattedPhone}@c.us` : `55${formattedPhone}@c.us`;

        await wahaApi.sendMessage({
          session: wahaSession.name,
          text: notification.message,
          chatId: chatId,
        });

        successCount++;

        // Pequeno delay entre mensagens para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao enviar notificação para ${notification.clientName}:`, error);
        failedNotifications.push(`${notification.clientName} (${notification.clientPhone})`);
      }
    }

    // Retornar resultado
    if (successCount === 0) {
      return {
        success: false,
        error: "Nenhuma notificação foi enviada com sucesso",
        failedNotifications,
      };
    }

    if (failedNotifications.length > 0) {
      return {
        success: true,
        count: successCount,
        error: `${successCount} notificações enviadas, ${failedNotifications.length} falharam`,
        failedNotifications,
      };
    }

    return {
      success: true,
      count: successCount,
    };
  } catch (error) {
    console.error("Erro ao enviar notificações:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}
