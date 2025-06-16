import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { Subscription } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

// Interface para a resposta
interface SubscriptionStatusResponse {
  subscription: Subscription;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  canAccessPremiumFeatures: boolean;
  trialDaysRemaining?: number;
  hasRemainingCredits: boolean;
  aiCreditsInfo?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

// Função para obter o limite de créditos baseado na assinatura
function getAICreditsLimit(subscription: any): number {
  if (!subscription || subscription.status !== "active") {
    return 0;
  }

  const { stripePriceId } = subscription;
  
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!) {
    return 100;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!) {
    return 200;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!) {
    return 300;
  }
  
  return 0;
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
    let hasRemainingCredits = true;
    let aiCreditsInfo = undefined;

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

        // Status ativos conforme documentação do Stripe
        const activeStatuses: Stripe.Subscription.Status[] = [
          "active",
          "trialing",
          "past_due", // Incluir past_due como ativo para dar chance de pagamento
        ];

        isSubscriptionActive = activeStatuses.includes(stripeSubscription.status);
        
        // Verificar créditos de IA se for um plano com IA
        const aiLimit = getAICreditsLimit(subscription);
        if (aiLimit > 0) {
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);

          // Buscar uso de IA do mês atual
          const aiUsageResult = await prisma.aIUsage.groupBy({
            by: ['clientPhone'],
            where: {
              userId,
              date: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
              },
            },
          });

          const usedCredits = aiUsageResult.length;
          const remainingCredits = Math.max(0, aiLimit - usedCredits);
          hasRemainingCredits = remainingCredits > 0;

          aiCreditsInfo = {
            used: usedCredits,
            limit: aiLimit,
            remaining: remainingCredits,
          };
        }
        
        // A assinatura só é considerada ativa se tiver status ativo E créditos restantes (para planos de IA)
        if (aiLimit > 0) {
          isSubscriptionActive = isSubscriptionActive && hasRemainingCredits;
        }
        
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
      hasRemainingCredits,
      aiCreditsInfo,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
