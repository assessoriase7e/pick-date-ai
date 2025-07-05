import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { Subscription } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { isLifetimeUser } from "@/lib/lifetime-user";
import { getAICreditsLimit } from "@/lib/subscription-limits";

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

// Remover a função getAICreditsLimit local, agora importada de @/lib/subscription-limits

// Modificar apenas o cabeçalho da função GET
export async function GET() {
  // Configurar cabeçalhos para cache
  const headers = {
    "Cache-Control": "max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  };

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    // Buscar usuário do Clerk para verificar metadados
    const clerkUser = await currentUser();
    const isLifetime = clerkUser ? await isLifetimeUser() : false;

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

    // Se estiver em período de teste, definir créditos de IA como infinitos
    if (isTrialActive) {
      aiCreditsInfo = {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
      };
      hasRemainingCredits = true;
    } else if (subscription) {
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
        const aiLimit = await getAICreditsLimit(subscription);
        if (aiLimit > 0) {
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);

          // Buscar uso de IA do mês atual
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

    // Para usuários lifetime, sempre retornar como ativo
    // Modificar os retornos para incluir os headers de cache
    if (isLifetime) {
      return NextResponse.json(
        {
          subscription: user?.subscription || null,
          isTrialActive: false,
          isSubscriptionActive: true,
          canAccessPremiumFeatures: true,
          hasRemainingCredits: true,
          aiCreditsInfo: {
            used: 0,
            limit: Infinity,
            remaining: Infinity,
          },
        },
        { headers }
      );
    }

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
