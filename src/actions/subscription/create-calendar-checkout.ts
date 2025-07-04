"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCalendarCheckout() {
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

    let customerId = user.subscription?.stripeCustomerId;

    // Criar customer no Stripe se não existir
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Se já existe uma subscription no banco, atualizar
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { stripeCustomerId: customerId },
        });
      } 
      // Se não existe, criar um registro básico de subscription
      else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: "placeholder_" + Date.now(), // Placeholder temporário
            stripePriceId: "free",
            stripeProductId: "free",
            status: "inactive",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
          },
        });
      }
    }

    // Criar checkout session para o produto de calendário adicional
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!,
        quantity: 1
      }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
      metadata: { userId },
    });

    if (session.url) {
      redirect(session.url);
    }

    return { success: true };
  } catch (error) {
    // Verificar se é um redirecionamento do Next.js
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // Apenas propaga o erro de redirecionamento
      throw error;
    }
    
    console.error("Erro ao criar checkout para calendário adicional:", error);
    throw error;
  }
}