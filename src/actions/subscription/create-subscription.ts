"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

/**
 * Cria uma nova assinatura
 */
export async function createSubscription(priceId: string): Promise<{ success: boolean; url?: string }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    // Verificações para produtos adicionais
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_CALENDAR) {
      if (!dbUser.subscription || dbUser.subscription.status !== "active") {
        throw new Error("É necessário ter um plano base ativo para assinar calendários extras");
      }
    }

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300) {
      if (
        !dbUser.subscription ||
        dbUser.subscription.status !== "active" ||
        ![
          process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100,
          process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200,
          process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300,
        ].includes(dbUser.subscription.stripePriceId)
      ) {
        throw new Error("É necessário ter um plano de IA ativo para contratar créditos adicionais");
      }
    }

    // Obter ou criar customer ID
    let customerId = dbUser.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      if (dbUser.subscription) {
        await prisma.subscription.update({
          where: { id: dbUser.subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: { userId: user.id },
    });

    // Revalidar o cache
    revalidatePath("/api/subscription/status");

    return { success: true, url: session.url || undefined };
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    throw error;
  }
}
