"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createApiKey(data: { description?: string }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        description: data.description,
        key: `sk_${Math.random()
          .toString(36)
          .substring(2)}${Date.now().toString(36)}`,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    revalidatePath("/api-keys");
    return { success: true, data: apiKey };
  } catch (error) {
    console.error("Erro ao criar chave de API:", error);
    return { success: false, error: "Falha ao criar chave de API" };
  }
}
