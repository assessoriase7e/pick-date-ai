"use server";

import { revalidateTag } from "next/cache";

export async function revalidateSubscriptionCache() {
  try {
    revalidateTag("subscription-status");
    return { success: true };
  } catch (error) {
    console.error("Erro ao revalidar o cache da assinatura:", error);
    return { success: false, error: "Falha ao revalidar o cache da assinatura" };
  }
}