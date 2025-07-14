"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { isLifetimeUser } from "@/lib/lifetime-user";
import { SubscriptionData, SubscriptionStatus } from "@/types/subscription";
import { unstable_cache } from "next/cache";

/**
 * Busca o status da assinatura do usuário atual
 */
export async function getSubscriptionStatus(): Promise<SubscriptionData | null> {
  const user = await currentUser();
  if (!user?.id) return null;

  // Usar unstable_cache para armazenar o resultado em cache por 1 hora
  return getSubscriptionStatusCached(user.id);
}

// Função com cache que será revalidada a cada hora
const getSubscriptionStatusCached = unstable_cache(
  async (userId: string): Promise<SubscriptionData | null> => {
    try {
      // Buscar usuário do banco de dados com a assinatura
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          additionalCalendars: {
            where: { active: true },
          },
        },
      });

      if (!dbUser) return null;

      // Verificar se é usuário lifetime
      const isLifetime = await isLifetimeUser();

      if (isLifetime) {
        return {
          subscription: dbUser?.subscription
            ? {
                id: dbUser.subscription.id,
                userId: dbUser.subscription.userId,
                stripeCustomerId: dbUser.subscription.stripeCustomerId,
                stripeSubscriptionId: dbUser.subscription.stripeSubscriptionId,
                status: dbUser.subscription.status as SubscriptionStatus,
                stripePriceId: dbUser.subscription.stripePriceId,
                stripeProductId: dbUser.subscription.stripeProductId,
                planType: (dbUser.subscription.planType || "basic") as any,
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

      // Cálculo do trial
      const trialEndDate = new Date(dbUser.createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + 3);
      const now = new Date();
      let isTrialActive = now < trialEndDate;
      let trialDaysRemaining = isTrialActive
        ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let subscription = dbUser.subscription;
      let isSubscriptionActive = false;
      let canAccessPremiumFeatures = isTrialActive;

      if (subscription) {
        try {
          // Verificar assinatura no Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

          // Atualizar status se necessário
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
          const activeStatuses = ["active", "trialing", "past_due"];
          isSubscriptionActive = activeStatuses.includes(stripeSubscription.status);

          // Se a assinatura estiver ativa, priorizar ela sobre o trial
          if (isSubscriptionActive) {
            canAccessPremiumFeatures = true;
            isTrialActive = false;
            trialDaysRemaining = 0;
          }

          canAccessPremiumFeatures = isTrialActive || isSubscriptionActive;
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
              planType: (subscription.planType || "basic") as any,
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
  ["subscription-status"],  // Cache key
  { revalidate: 3600 }  // Revalidar a cada 1 hora (3600 segundos)
);
