"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { startOfMonth, endOfMonth } from "date-fns";
import { isLifetimeUser } from "@/lib/lifetime-user";
// Remover a importação das funções de cache
// import { getSubscriptionFromCache, setSubscriptionCache } from "@/utils/subscription-cache";
import { getAICreditsLimit } from "@/lib/subscription-limits";
import { AdditionalCalendar } from "@prisma/client";

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    stripePriceId: string;
    stripeProductId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  } | null;
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
  additionalCalendars?: AdditionalCalendar[];
}

// Remover a função getAICreditsLimit local, agora importada de @/lib/subscription-limits

export async function getSubscriptionStatus(): Promise<SubscriptionData> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        additionalCalendars: {
          where: { active: true },
        },
      },
    });

    console.log(user);

    if (!user) {
      throw new Error("User not found");
    }

    const trialEndDate = new Date(user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const now = new Date();
    const isTrialActive = now < trialEndDate;

    const trialDaysRemaining = isTrialActive
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let subscription = user.subscription;
    let isSubscriptionActive = false;
    let canAccessPremiumFeatures = isTrialActive;
    let hasRemainingCredits = true;
    let aiCreditsInfo = undefined;

    // Se estiver em período de teste, definir créditos de IA como infinitos
    if (isTrialActive) {
      aiCreditsInfo = {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
      };
      hasRemainingCredits = true;
    }

    // Verificar assinatura mesmo se estiver em período de teste
    if (subscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

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

        const activeStatuses: Stripe.Subscription.Status[] = ["active", "trialing", "past_due"];

        isSubscriptionActive = activeStatuses.includes(stripeSubscription.status);

        // Se tiver assinatura ativa, priorizar isso sobre o período de teste
        if (isSubscriptionActive) {
          canAccessPremiumFeatures = true;
        }
        const aiLimit = await getAICreditsLimit(subscription);
        if (aiLimit > 0) {
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);

          const aiUsageResult = await prisma.aIUsage.groupBy({
            by: ["clientPhone"],
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

        if (aiLimit > 0) {
          isSubscriptionActive = isSubscriptionActive && hasRemainingCredits;
        }

        canAccessPremiumFeatures = isTrialActive || isSubscriptionActive;
      } catch (error) {
        console.error("Erro ao verificar assinatura no Stripe:", error);
      }
    }

    let result: SubscriptionData;

    // In the return statements, convert dates to strings
    if (await isLifetimeUser()) {
      result = {
        subscription: user?.subscription
          ? {
              ...user.subscription,
              currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
              trialEnd: user.subscription.trialEnd?.toISOString(),
            }
          : null,
        isTrialActive: false,
        isSubscriptionActive: true,
        canAccessPremiumFeatures: true,
        trialDaysRemaining: 0,
        hasRemainingCredits: true,
        aiCreditsInfo: {
          used: 0,
          limit: Infinity,
          remaining: Infinity,
        },
        additionalCalendars: user.additionalCalendars,
      };
    } else {
      result = {
        subscription: subscription
          ? {
              ...subscription,
              currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
              trialEnd: subscription.trialEnd?.toISOString(),
            }
          : null,
        isTrialActive,
        isSubscriptionActive,
        canAccessPremiumFeatures,
        trialDaysRemaining,
        hasRemainingCredits,
        aiCreditsInfo,
        additionalCalendars: user.additionalCalendars,
      };
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    throw error;
  }
}
