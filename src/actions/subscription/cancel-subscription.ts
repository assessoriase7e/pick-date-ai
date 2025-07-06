"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

/**
 * Cancela a assinatura do usuário
 */
export async function cancelSubscription(): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
        additionalCalendars: {
          where: { active: true },
        },
      },
    });

    if (!dbUser || !dbUser.subscription) {
      throw new Error("Subscription not found");
    }

    // Cancelar assinatura principal
    await stripe.subscriptions.update(dbUser.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Cancelar calendários adicionais
    for (const additionalCalendar of dbUser.additionalCalendars) {
      if (additionalCalendar.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(additionalCalendar.stripeSubscriptionId);
      }

      await prisma.additionalCalendar.update({
        where: { id: additionalCalendar.id },
        data: { active: false },
      });
    }

    // Atualizar no banco
    await prisma.subscription.update({
      where: { id: dbUser.subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    // Revalidar cache
    revalidatePath("/api/subscription/status");

    return {
      success: true,
      message: "Subscription and all additional services cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}