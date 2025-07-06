"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/**
 * Cria uma sessão do portal de faturamento do Stripe
 */
export async function createPortalSession(): Promise<{ success: boolean; url?: string }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });

    if (!dbUser?.subscription?.stripeCustomerId) {
      throw new Error("No customer found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
    });

    return { success: true, url: session.url || undefined };
  } catch (error) {
    console.error("Erro ao criar sessão do portal:", error);
    throw error;
  }
}