import { auth } from "@clerk/nextjs/server";
import { invalidateSubscriptionCache } from "@/utils/subscription-cache";

export async function invalidateUserSubscriptionCache() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await invalidateSubscriptionCache(userId);
    
    return {
      success: true,
      message: "Cache de assinatura invalidado com sucesso"
    };
  } catch (error) {
    console.error("Erro ao invalidar cache de assinatura:", error);
    throw error;
  }
}