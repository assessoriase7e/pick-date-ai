"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createSubscription(priceId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verificar se o usuário está tentando assinar calendários extras sem ter um plano base
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR) {
      // Verificar se o usuário tem uma assinatura ativa
      if (!user.subscription || user.subscription.status !== "active") {
        throw new Error("É necessário ter um plano base ativo para assinar calendários extras");
      }
    }

    // Verificar se o usuário está tentando contratar créditos adicionais sem ter um plano IA
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_10) {
      // Verificar se o usuário tem um plano de IA ativo
      if (!user.subscription || user.subscription.status !== "active" || 
          ![
            process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100,
            process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200,
            process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300
          ].includes(user.subscription.stripePriceId)) {
        throw new Error("É necessário ter um plano de IA ativo para contratar créditos adicionais");
      }
    }

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;

      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: { userId },
    });

    if (session.url) {
      redirect(session.url);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    throw error;
  }
}