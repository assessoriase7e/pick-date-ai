"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import Axios from "axios";

interface SendFileToClientsParams {
  fileIds: number[];
  clientIds: number[];
}

interface SendFileToClientsResponse {
  success: boolean;
  sentCount?: number;
  error?: string;
}

export async function sendFileToClients({
  fileIds,
  clientIds
}: SendFileToClientsParams): Promise<SendFileToClientsResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Buscar os arquivos
    const files = await prisma.fileRecord.findMany({
      where: {
        id: { in: fileIds },
        userId: user.id
      }
    });

    if (files.length === 0) {
      return { success: false, error: "Nenhum arquivo encontrado" };
    }

    // Buscar os clientes
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        userId: user.id
      }
    });

    if (clients.length === 0) {
      return { success: false, error: "Nenhum cliente encontrado" };
    }

    // Buscar a instância Evolution API ativa
    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: {
        userId: user.id,
        status: "CONNECTED"
      }
    });

    if (!evolutionInstance) {
      return { success: false, error: "Nenhuma instância Evolution API conectada" };
    }

    const evolutionApiUrl = process.env.EVOLUTION_API_URL as string;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY as string;

    const evoAxios = Axios.create({
      headers: {
        apikey: evolutionApiKey,
      },
      baseURL: evolutionApiUrl,
    });

    // Enviar arquivos para cada cliente com delay
    let sentCount = 0;

    for (const client of clients) {
      for (const file of files) {
        try {
          // Enviar arquivo via Evolution API
          await evoAxios.post(`/message/sendMedia/${evolutionInstance.name}`, {
            number: client.phone,
            mediaUrl: file.fileUrl,
            fileName: file.fileName,
            caption: file.description || file.fileName
          });

          sentCount++;

          // Adicionar delay de 3 segundos entre envios
          if (sentCount < clients.length * files.length) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Erro ao enviar arquivo ${file.id} para cliente ${client.id}:`, error);
          // Continuar tentando enviar os outros arquivos
        }
      }
    }

    return { 
      success: true, 
      sentCount 
    };
  } catch (error) {
    console.error("Erro ao enviar arquivos para clientes:", error);
    return { success: false, error: "Erro ao processar a solicitação" };
  }
}