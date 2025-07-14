import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { PlanType } from "@/types/subscription";
import { revalidateSubscriptionCache } from "@/actions/subscription/revalidate-subscription";

export async function handleSubscriptionCreated(subscription: Stripe.Subscription, userId: string) {
  const price = subscription.items.data[0]?.price;
  const item = subscription.items.data[0];

  if (!price || !item) {
    throw new Error("Invalid subscription data: missing price or item");
  }

  const productId = typeof price.product === "string" ? price.product : price.product?.id;
  const priceId = price.id;

  // Verificar se é uma assinatura de calendário adicional
  if (
    productId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_CALENDAR ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_CALENDAR
  ) {
    await prisma.additionalCalendar.create({
      data: {
        userId,
        active: true,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(item.current_period_end * 1000),
        expiresAt: new Date(item.current_period_end * 1000),
      },
    });
  } else {
    if (!productId) {
      throw new Error("Invalid subscription data: missing product ID");
    }

    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

    if (!customerId) {
      throw new Error("Invalid subscription data: missing customer ID");
    }

    // Obter informações do produto e determinar o tipo de plano
    const { planName, planType } = await getProductInfo(productId, priceId);

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: price.id,
        stripeProductId: productId,
        planName,
        planType,
        status: subscription.status,
        currentPeriodStart: new Date(item.current_period_start * 1000),
        currentPeriodEnd: new Date(item.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      },
      create: {
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: price.id,
        stripeProductId: productId,
        planName,
        planType,
        status: subscription.status,
        currentPeriodStart: new Date(item.current_period_start * 1000),
        currentPeriodEnd: new Date(item.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      },
    });
  }

  // Código existente para criar/atualizar assinatura

  // Revalidar o cache da assinatura
  await revalidateSubscriptionCache();
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];

  if (!item) {
    throw new Error("Invalid subscription data: missing item");
  }

  // Buscar a assinatura atual no banco
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    console.error("Assinatura não encontrada no banco de dados");
    return;
  }

  const newPriceId = item.price.id;

  // Atualizar a assinatura no banco
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripePriceId: newPriceId,
      status: subscription.status,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Código existente para atualizar assinatura

  // Revalidar o cache da assinatura
  await revalidateSubscriptionCache();
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Verificar se é uma assinatura de calendário adicional
  const additionalCalendar = await prisma.additionalCalendar.findFirst({
    where: {
      stripeSubscriptionId: subscription.id,
      active: true,
    },
  });

  if (additionalCalendar) {
    await prisma.additionalCalendar.update({
      where: { id: additionalCalendar.id },
      data: { active: false },
    });
  } else {
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" },
      });
    }
  }

  // Código existente para marcar assinatura como cancelada

  // Revalidar o cache da assinatura
  await revalidateSubscriptionCache();
}

// Função auxiliar para obter informações do produto
async function getProductInfo(productId: string, priceId: string): Promise<{ planName: string; planType: PlanType }> {
  try {
    const product = await stripe.products.retrieve(productId);
    const planName = product.name || getPlanNameFallback(priceId);
    const planType = getPlanType(priceId);
    return { planName, planType };
  } catch (error) {
    console.error("Error fetching product from Stripe:", error);
    return {
      planName: getPlanNameFallback(priceId),
      planType: getPlanType(priceId),
    };
  }
}

// Função auxiliar para obter o nome do plano (fallback)
function getPlanNameFallback(productId: string): string {
  switch (productId) {
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC:
      return "Plano Base";
    default:
      return "Plano Desconhecido";
  }
}

// Função auxiliar para determinar o tipo de plano
function getPlanType(priceId: string): PlanType {
  switch (priceId) {
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC:
      return "basic";
    default:
      return "basic";
  }
}
