"use server";

import { prisma } from "@/lib/db";
import { createInstanceSchema } from "@/validators/evolution";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const evolutionApiUrl = process.env.EVOLUTION_API_URL || "";
const evolutionApiKey = process.env.EVOLUTION_API_KEY || "";

export type CreateInstanceFormValues = z.infer<typeof createInstanceSchema>;

export async function createInstance(data: CreateInstanceFormValues) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const validation = createInstanceSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: "Dados inválidos",
      };
    }

    const response = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
      },
      body: JSON.stringify({
        instanceName: data.name,
        qrcode: data.qrCode,
        number: data.number,
        webhookUrl: data.webhookUrl,
        integration: "WHATSAPP-BAILEYS",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Erro ao criar instância",
      };
    }

    const instance = await prisma.evolutionInstance.create({
      data: {
        name: data.name,
        number: data.number,
        qrCode: result.qrcode.base64,
        webhookUrl: data.webhookUrl,
        apiKey: result.apiKey || evolutionApiKey,
        userId,
      },
    });

    revalidatePath("/agents");

    return {
      success: true,
      data: instance,
    };
  } catch (error) {
    console.error("Erro ao criar instância:", error);
    return {
      success: false,
      error: "Falha ao criar instância",
    };
  }
}
