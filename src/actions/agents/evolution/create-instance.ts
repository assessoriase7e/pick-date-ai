"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createInstanceSchema = z.object({
  userId: z.string(),
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  webhookUrl: z.string().url("URL de webhook inválida"),
  qrCode: z.boolean().default(true),
});

export type CreateInstanceParams = z.infer<typeof createInstanceSchema>;

export async function createInstance(params: CreateInstanceParams) {
  try {
    const validation = createInstanceSchema.safeParse(params);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { userId, instanceName, number, webhookUrl, qrCode } = params;

    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          instanceName,
          token: "",
          qrcode: qrCode,
          number,
          webhook: webhookUrl,
          webhook_by_events: true,
          events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "SEND_MESSAGE"],
          reject_call: true,
          msg_call: "Não posso atender sua ligação no momento.",
          groups_ignore: false,
          always_online: true,
          read_messages: true,
          read_status: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Falha ao criar instância",
      };
    }

    const data = await response.json();

    await prisma.evolution.create({
      data: {
        userId,
        instanceName,
        instanceId: data.instance.instanceId,
        number,
        webhookUrl,
        apiKey: data.hash.apikey,
        qrCode,
        status: data.instance.status,
      },
    });

    revalidatePath("/agents");
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao criar instância:", error);
    return {
      success: false,
      error: "Falha ao criar instância",
    };
  }
}
