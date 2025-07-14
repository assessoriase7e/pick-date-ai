"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

import { SubscriptionData, SubscriptionStatus } from "@/types/subscription";
import { unstable_cache } from "next/cache";
import { isLifetimeUser } from "@/lib/lifetime-user";

/**
 * Busca o status da assinatura do usuário atual.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionData | null> {
  const user = await currentUser();
  if (!user?.id) return null;

  const isLifetime = await isLifetimeUser();

  return getSubscriptionStatusCached(user.id, isLifetime);
}

// Função cacheada, revalidada a cada 1 hora
const getSubscriptionStatusCached = unstable_cache(
  async (userId: string, isLifetime: boolean): Promise<SubscriptionData | null> => {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          additionalCalendars: { where: { active: true } },
        },
      });

      if (!dbUser) return null;

      // Caso usuário seja vitalício
      if (isLifetime) {
        return {
          subscription: dbUser.subscription
            ? {
                id: dbUser.subscription.id,
                userId: dbUser.subscription.userId,
                stripeCustomerId: dbUser.subscription.stripeCustomerId,
                stripeSubscriptionId: dbUser.subscription.stripeSubscriptionId,
                status: dbUser.subscription.status as SubscriptionStatus,
                stripePriceId: dbUser.subscription.stripePriceId,
                stripeProductId: dbUser.subscription.stripeProductId,
                planType: (dbUser.subscription.planType || "basic") as SubscriptionData["subscription"]["planType"],
                planName: dbUser.subscription.planName,
                cancelAtPeriodEnd: dbUser.subscription.cancelAtPeriodEnd,
                currentPeriodStart: dbUser.subscription.currentPeriodStart,
                currentPeriodEnd: dbUser.subscription.currentPeriodEnd,
                trialStart: dbUser.subscription.trialStart,
                trialEnd: dbUser.subscription.trialEnd,
                createdAt: dbUser.subscription.createdAt,
                updatedAt: dbUser.subscription.updatedAt,
              }
            : null,
          isTrialActive: false,
          isSubscriptionActive: true,
          canAccessPremiumFeatures: true,
          trialDaysRemaining: 0,
          additionalCalendars: dbUser.additionalCalendars.map((cal) => ({
            id: cal.id.toString(),
            active: cal.active,
            expiresAt: cal.expiresAt.toISOString(),
          })),
        };
      }

      // Verificação de período de trial
      const trialEndDate = new Date(dbUser.createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + 7); // Alterado de 3 para 7 dias

      const now = new Date();
      const isTrialActive = now < trialEndDate;
      const trialDaysRemaining = isTrialActive
        ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let subscription = dbUser.subscription;
      let isSubscriptionActive = false;
      let canAccessPremiumFeatures = isTrialActive;

      if (subscription) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

          const item = stripeSubscription.items.data[0];
          if (item) {
            // Atualiza dados se houver divergência
            if (stripeSubscription.status !== subscription.status) {
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

            const activeStatuses = ["active", "trialing", "past_due"];
            isSubscriptionActive = activeStatuses.includes(stripeSubscription.status);

            if (isSubscriptionActive) {
              canAccessPremiumFeatures = true;
            }
          }
        } catch (error) {
          console.error("Erro ao verificar assinatura no Stripe:", error);
        }
      }

      return {
        subscription: subscription
          ? {
              id: subscription.id,
              userId: subscription.userId,
              stripeCustomerId: subscription.stripeCustomerId,
              stripeSubscriptionId: subscription.stripeSubscriptionId,
              status: subscription.status as SubscriptionStatus,
              stripePriceId: subscription.stripePriceId,
              stripeProductId: subscription.stripeProductId,
              planType: (subscription.planType || "basic") as SubscriptionData["subscription"]["planType"],
              planName: subscription.planName,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              currentPeriodStart: subscription.currentPeriodStart,
              currentPeriodEnd: subscription.currentPeriodEnd,
              trialStart: subscription.trialStart,
              trialEnd: subscription.trialEnd,
              createdAt: subscription.createdAt,
              updatedAt: subscription.updatedAt,
            }
          : null,
        isTrialActive,
        isSubscriptionActive,
        canAccessPremiumFeatures,
        trialDaysRemaining,
        additionalCalendars: dbUser.additionalCalendars.map((cal) => ({
          id: cal.id.toString(),
          active: cal.active,
          expiresAt: cal.expiresAt.toISOString(),
        })),
      };
    } catch (err) {
      console.error("Erro ao buscar status da assinatura:", err);
      return null;
    }
  },
  ["subscription-status"],
  { revalidate: 3600 } // 1 hora em segundos
);
