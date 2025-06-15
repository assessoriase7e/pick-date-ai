import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { Subscription } from "@prisma/client";

// Interface para a resposta
interface SubscriptionStatusResponse {
  subscription: Subscription;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  canAccessPremiumFeatures: boolean;
  trialDaysRemaining?: number;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cálculo do trial com mais precisão
    const trialEndDate = new Date(user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const now = new Date();
    const isTrialActive = now < trialEndDate;

    // Calcular dias restantes do trial
    const trialDaysRemaining = isTrialActive
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let subscription = user.subscription;
    let isSubscriptionActive = false;
    let canAccessPremiumFeatures = isTrialActive;

    if (subscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

        // Verificar se o status mudou e atualizar no banco
        if (stripeSubscription.status !== subscription.status) {
          const item = stripeSubscription.items.data[0];

          if (item) {
            subscription = await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: stripeSubscription.status,
                currentPeriodStart: new Date(item.current_period_start * 1000),
                currentPeriodEnd: new Date(item.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              },
            });
          }
        }

        // Status ativos conforme documentação do Stripe 2024 <mcreference link="https://docs.stripe.com/billing/subscriptions/webhooks" index="2">2</mcreference>
        const activeStatuses: Stripe.Subscription.Status[] = [
          "active",
          "trialing",
          "past_due", // Incluir past_due como ativo para dar chance de pagamento
        ];

        isSubscriptionActive = activeStatuses.includes(stripeSubscription.status);
        canAccessPremiumFeatures = isTrialActive || isSubscriptionActive;
      } catch (error) {
        console.error("Erro ao verificar assinatura no Stripe:", error);

        // Se houver erro na verificação do Stripe, usar dados locais
        if (error instanceof Stripe.errors.StripeError) {
          console.error("Stripe API Error:", error.message);
        }
      }
    }

    const response: SubscriptionStatusResponse = {
      subscription,
      isTrialActive,
      isSubscriptionActive,
      canAccessPremiumFeatures,
      trialDaysRemaining,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
