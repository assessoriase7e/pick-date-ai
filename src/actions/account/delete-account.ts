"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function deleteAccount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        additionalCalendars: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Cancelar assinatura principal se existir
    if (user.subscription?.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
    }

    // Cancelar todos os calendários adicionais
    for (const additionalCalendar of user.additionalCalendars) {
      if (additionalCalendar.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(additionalCalendar.stripeSubscriptionId);
      }
    }

    // Deletar usuário (cascade irá deletar relacionamentos)
    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      success: true,
      message: "Account and all services deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}