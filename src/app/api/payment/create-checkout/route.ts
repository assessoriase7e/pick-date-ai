import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

interface CreatePaymentRequest {
  priceId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreatePaymentRequest = await request.json();
    const { priceId } = body;

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json(
        { error: "Price ID is required and must be a string" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar se tem plano de IA ativo para comprar créditos adicionais
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_AI) {
      if (
        !user.subscription ||
        user.subscription.status !== "active" ||
        ![
          process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100,
          process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200,
          process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300,
        ].includes(user.subscription.stripePriceId)
      ) {
        return NextResponse.json(
          { error: "É necessário ter um plano de IA ativo para contratar créditos adicionais" },
          { status: 400 }
        );
      }
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

      // Atualizar subscription com o customerId se existir
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment", // Pagamento único
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId: user.id,
        type: "one_time_payment",
        productType: "ai_credits",
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar checkout session:", error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}