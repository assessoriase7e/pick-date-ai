"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateInstanceSchema = z.object({
  id: z.string(),
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  webhookUrl: z.string().url("URL de webhook inválida"),
  qrCode: z.boolean().default(true),
});

export type UpdateInstanceParams = z.infer<typeof updateInstanceSchema>;

export async function updateInstance(params: UpdateInstanceParams) {
  try {
    const validation = updateInstanceSchema.safeParse(params);
    
    if (!validation.success) {
      return { 
        success: false, 
        error: validation.error.errors[0].message 
      };
    }

    const { id, instanceName, number, webhookUrl, qrCode } = params;

    // Buscar a instância no banco de dados
    const instance = await prisma.evolution.findUnique({
      where: { id },
    });

    if (!instance) {
      return { 
        success: false, 
        error: "Instância não encontrada" 
      };
    }

    // Atualizar a instância na API da Evolution
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/update/${instance.instanceName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          instanceName,
          webhook: webhookUrl,
          number,
          qrcode: qrCode,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.message || "Falha ao atualizar instância" 
      };
    }

    // Atualizar a instância no banco de dados
    await prisma.evolution.update({
      where: { id },
      data: {
        instanceName,
        number,
        webhookUrl,
        qrCode,
      },
    });

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar instância:", error);
    return { 
      success: false, 
      error: "Falha ao atualizar instância" 
    };
  }
}