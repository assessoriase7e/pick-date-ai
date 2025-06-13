"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import moment from "moment";
import { evolution } from "@/utils/evolution";

interface SendNotificationParams {
  date: Date;
  message: string;
  instanceName?: string; // Nome da instância Evolution API
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

    // Verificar se há uma instância Evolution configurada
    let evolutionInstance;
    if (instanceName) {
      evolutionInstance = await prisma.evolutionInstance.findFirst({
        where: {
          name: instanceName,
          userId,
        },
      });
    } else {
      // Buscar a primeira instância ativa do usuário
      evolutionInstance = await prisma.evolutionInstance.findFirst({
        where: {
          userId,
          status: "open", // Apenas instâncias conectadas
        },
      });
    }

    if (!evolutionInstance) {
      return {
        success: false,
        error: "Nenhuma instância do WhatsApp encontrada ou conectada. Configure uma instância na seção Agentes.",
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

    // Enviar notificações via Evolution API
    const evolutionApi = evolution();
    const failedNotifications: string[] = [];
    let successCount = 0;

    for (const notification of processedNotifications) {
      if (!notification.clientPhone) {
        console.warn(`Cliente ${notification.clientName} não possui telefone cadastrado`);
        failedNotifications.push(`${notification.clientName} (sem telefone)`);
        continue;
      }

      try {
        // Formatar número para o padrão internacional (remover caracteres especiais)
        const formattedPhone = notification.clientPhone.replace(/\D/g, "");

        // Adicionar código do país se não estiver presente (assumindo Brasil +55)
        const phoneNumber = formattedPhone.startsWith("55") ? formattedPhone : `55${formattedPhone}`;

        await evolutionApi.sendMessage({
          instance: evolutionInstance.name,
          text: notification.message,
          number: phoneNumber,
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
