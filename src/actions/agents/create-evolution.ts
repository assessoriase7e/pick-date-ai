"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const evolutionSchema = z.object({
  userId: z.string(),
  webhookUrl: z.string().url(),
});

export async function createEvolution(data: z.infer<typeof evolutionSchema>) {
  try {
    const { userId } = await auth();

    if (!userId || userId !== data.userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const mockEvolution = {
      id: `mock-${Date.now()}`,
      userId: data.userId,
      webhookUrl: data.webhookUrl,
      instanceId: `ev-${Date.now()}`,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: mockEvolution,
    };
  } catch (error) {
    console.error("[EVOLUTION_CREATE]", error);
    return {
      success: false,
      error: "Falha ao criar instância Evolution",
    };
  }
}
