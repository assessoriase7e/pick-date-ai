"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { startOfMonth, endOfMonth } from "date-fns";
import { isLifetimeUser } from "@/lib/lifetime-user";

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
}

async function getAICreditsLimit(subscription: any, user?: any): Promise<number> {
  if (user && await isLifetimeUser()) {
    return Infinity;
  }

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

export async function getSubscriptionStatus(): Promise<SubscriptionData> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const clerkUser = await currentUser();
    const isLifetime = clerkUser ? await isLifetimeUser() : false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

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

    // In the return statements, convert dates to strings
    if (isLifetime) {
      return {
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
      };
    }

    return {
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
    };
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    throw error;
  }
}
