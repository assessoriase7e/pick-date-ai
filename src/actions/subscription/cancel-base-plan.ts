"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
// Remover a importação de revalidatePath
// import { revalidatePath } from "next/cache";
// Adicionar a importação da função correta
import { revalidateSubscriptionCache } from "@/actions/subscription/revalidate-subscription";

/**
 * Cancela apenas o plano base do usuário, mantendo calendários adicionais
 */
export async function cancelBasePlan(): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
      },
    });

    if (!dbUser || !dbUser.subscription) {
      throw new Error("Subscription not found");
    }

    // Verificar se é um plano base
    const isBasePlan = dbUser.subscription.stripeProductId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;

    if (!isBasePlan) {
      throw new Error("Esta função é apenas para cancelamento de planos base");
    }

    // Cancelar apenas a assinatura principal
    await stripe.subscriptions.update(dbUser.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Atualizar no banco
    await prisma.subscription.update({
      where: { id: dbUser.subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    // Revalidar cache usando a função correta
    await revalidateSubscriptionCache();

    return {
      success: true,
      message: "Plano base cancelado com sucesso. Calendários adicionais permanecem ativos.",
    };
  } catch (error) {
    console.error("Error cancelling base plan:", error);
    throw error;
  }
}
