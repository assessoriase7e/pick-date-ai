"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const evolutionApiUrl =
  process.env.EVOLUTION_API_URL || "https://api.evolution-api.com";
const evolutionApiKey = process.env.EVOLUTION_API_KEY || "";

const updateInstanceSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  qrCode: z.boolean().default(true),
  webhookUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateInstanceFormValues = z.infer<typeof updateInstanceSchema>;

export async function updateInstance(data: UpdateInstanceFormValues) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Validar os dados
    const validation = updateInstanceSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: "Dados inválidos",
      };
    }

    // Verificar se a instância existe e pertence ao usuário
    const existingInstance = await prisma.evolutionInstance.findFirst({
      where: {
        id: data.id,
        userId,
      },
    });

    if (!existingInstance) {
      return {
        success: false,
        error: "Instância não encontrada",
      };
    }

    // Atualizar instância na Evolution API
    const response = await fetch(
      `${evolutionApiUrl}/instance/update/${existingInstance.name}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": evolutionApiKey,
        },
        body: JSON.stringify({
          instanceName: data.name,
          token: data.name,
          qrcode: data.qrCode,
          number: data.number,
          webhook: data.webhookUrl || null,
        }),
      }
    );
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Erro ao atualizar instância",
      };
    }

    // Atualizar instância no banco de dados
    const instance = await prisma.evolutionInstance.update({
      where: { id: data.id },
      data: {
        name: data.name,
        number: data.number,
        webhookUrl: data.webhookUrl || null,
      },
    });

    revalidatePath("/agents");

    return {
      success: true,
      data: instance,
    };
  } catch (error) {
    console.error("Erro ao atualizar instância:", error);
    return {
      success: false,
      error: "Falha ao atualizar instância",
    };
  }
}
