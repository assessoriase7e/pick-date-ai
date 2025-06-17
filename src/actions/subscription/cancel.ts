"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { invalidateSubscriptionCache } from "@/utils/subscription-cache";

export async function cancelSubscription() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      throw new Error("Subscription not found");
    }

    const { subscription } = user;

    // Cancelar no Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Atualizar no banco de dados
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    // Invalidar cache
    await invalidateSubscriptionCache(userId);

    return {
      success: true,
      message: "Subscription cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}