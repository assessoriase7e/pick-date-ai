"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { isLifetimeUser } from "@/lib/lifetime-user";
import { getAICreditsLimit } from "@/lib/subscription-limits";
import { startOfMonth, endOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { SubscriptionData, SubscriptionStatus } from "@/types/subscription";

/**
 * Busca o status da assinatura do usuário atual
 */
export async function getSubscriptionStatus(): Promise<SubscriptionData | null> {
  try {
    const user = await currentUser();
    if (!user?.id) return null;

    // Buscar usuário do banco de dados com a assinatura
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
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
              status: dbUser.subscription.status as SubscriptionStatus,
              stripePriceId: dbUser.subscription.stripePriceId,
              stripeProductId: dbUser.subscription.stripeProductId,
              planType: (dbUser.subscription.planType || "basic") as any,
              planName: dbUser.subscription.planName,
              cancelAtPeriodEnd: dbUser.subscription.cancelAtPeriodEnd,
              currentPeriodEnd: dbUser.subscription.currentPeriodEnd.toISOString(),
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
        additionalCalendars: dbUser.additionalCalendars.map((cal) => ({
          id: cal.id.toString(), // Converter para string
          active: cal.active,
          expiresAt: cal.expiresAt.toISOString(),
        })),
      };
    }

    // Cálculo do trial
    const trialEndDate = new Date(dbUser.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const now = new Date();
    let isTrialActive = now < trialEndDate; // Usar let em vez de const
    let trialDaysRemaining = isTrialActive // Usar let em vez de const
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let subscription = dbUser.subscription;
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
    } else if (subscription) {
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

        // Verificar créditos de IA
        const aiLimit = await getAICreditsLimit(subscription);
        if (aiLimit > 0) {
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);

          // Buscar uso de IA do mês atual
          const aiUsageResult = await prisma.aIUsage.groupBy({
            by: ["clientPhone"],
            where: {
              userId: user.id,
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

          // A assinatura só é considerada ativa se tiver status ativo E créditos restantes (para planos de IA)
          if (aiLimit > 0) {
            isSubscriptionActive = isSubscriptionActive && hasRemainingCredits;
          }
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
            status: subscription.status as SubscriptionStatus,
            stripePriceId: subscription.stripePriceId,
            stripeProductId: subscription.stripeProductId,
            planType: (subscription.planType || "basic") as any,
            planName: subscription.planName,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            trialEnd: trialEndDate.toISOString(),
          }
        : null,
      isTrialActive,
      isSubscriptionActive,
      canAccessPremiumFeatures,
      trialDaysRemaining,
      hasRemainingCredits,
      aiCreditsInfo,
      additionalCalendars: dbUser.additionalCalendars.map((cal) => ({
        id: cal.id.toString(), // Converter para string
        active: cal.active,
        expiresAt: cal.expiresAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Erro ao buscar status da assinatura:", err);
    return null;
  }
}

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
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR) {
      if (!dbUser.subscription || dbUser.subscription.status !== "active") {
        throw new Error("É necessário ter um plano base ativo para assinar calendários extras");
      }
    }

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_10) {
      if (
        !dbUser.subscription ||
        dbUser.subscription.status !== "active" ||
        ![
          process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100,
          process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200,
          process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300,
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

/**
 * Cancela a assinatura do usuário
 */
export async function cancelSubscription(): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
        additionalCalendars: {
          where: { active: true },
        },
      },
    });

    if (!dbUser || !dbUser.subscription) {
      throw new Error("Subscription not found");
    }

    // Cancelar assinatura principal
    await stripe.subscriptions.update(dbUser.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Cancelar calendários adicionais
    for (const additionalCalendar of dbUser.additionalCalendars) {
      if (additionalCalendar.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(additionalCalendar.stripeSubscriptionId);
      }

      await prisma.additionalCalendar.update({
        where: { id: additionalCalendar.id },
        data: { active: false },
      });
    }

    // Atualizar no banco
    await prisma.subscription.update({
      where: { id: dbUser.subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    // Revalidar cache
    revalidatePath("/api/subscription/status");

    return {
      success: true,
      message: "Subscription and all additional services cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

/**
 * Cria uma sessão do portal de faturamento do Stripe
 */
export async function createPortalSession(): Promise<{ success: boolean; url?: string }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });

    if (!dbUser?.subscription?.stripeCustomerId) {
      throw new Error("No customer found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
    });

    return { success: true, url: session.url || undefined };
  } catch (error) {
    console.error("Erro ao criar sessão do portal:", error);
    throw error;
  }
}
