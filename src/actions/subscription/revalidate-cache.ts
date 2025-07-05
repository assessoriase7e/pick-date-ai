"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function revalidateSubscriptionCache() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Revalidar a rota da API
    revalidatePath("/api/subscription/status");
    
    return {
      success: true,
      message: "Cache de assinatura revalidado com sucesso"
    };
  } catch (error) {
    console.error("Erro ao revalidar cache de assinatura:", error);
    throw error;
  }
}