"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

interface AddClientServiceParams {
  clientId: string;
  serviceId: string;
  date: Date;
}

interface AddClientServiceResult {
  success: boolean;
  error?: string;
  data?: {
    id: string;
  };
}

export async function addClientService({
  clientId,
  serviceId,
  date,
}: AddClientServiceParams): Promise<AddClientServiceResult> {
  try {
    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return {
        success: false,
        error: "Cliente não encontrado",
      };
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Criar o registro de serviço para o cliente
    const clientService = await prisma.clientService.create({
      data: {
        clientId,
        serviceId,
        date,
      },
    });

    // Revalidar o caminho para atualizar a UI
    revalidatePath(`/clients/${clientId}/services`);
    revalidateTag("services");

    return {
      success: true,
      data: {
        id: clientService.id,
      },
    };
  } catch (error) {
    console.error("Erro ao adicionar serviço ao cliente:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
