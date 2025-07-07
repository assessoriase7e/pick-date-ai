import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { PlanType } from "@/types/subscription";
import { deactivateAllAIAgents } from "@/lib/agent-utils";

// Enum para tipos de eventos do webhook
enum StripeWebhookEvent {
  CHECKOUT_SESSION_COMPLETED = "checkout.session.completed",
  SUBSCRIPTION_UPDATED = "customer.subscription.updated",
  SUBSCRIPTION_DELETED = "customer.subscription.deleted",
  INVOICE_PAYMENT_SUCCEEDED = "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED = "invoice.payment_failed",
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case StripeWebhookEvent.CHECKOUT_SESSION_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );

          if (session.metadata?.userId) {
            await handleSubscriptionCreated(subscription, session.metadata.userId);
          }
        }
        break;
      }

      case StripeWebhookEvent.SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case StripeWebhookEvent.SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case StripeWebhookEvent.INVOICE_PAYMENT_SUCCEEDED: {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case StripeWebhookEvent.INVOICE_PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        return;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, userId: string) {
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

  // Invalidar cache
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
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100:
      return "100 Atendimentos IA";
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200:
      return "200 Atendimentos IA";
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300:
      return "300 Atendimentos IA";
    default:
      return "Plano Desconhecido";
  }
}

// Função auxiliar para determinar o tipo de plano
function getPlanType(priceId: string): PlanType {
  switch (priceId) {
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC:
      return "basic";
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100:
      return "ai100";
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200:
      return "ai200";
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300:
      return "ai300";
    default:
      return "basic";
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
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
  const oldPriceId = existingSubscription.stripePriceId;

  // Verificar se houve mudança de plano IA para plano base
  const wasAIPlan = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!,
  ].includes(oldPriceId);

  const isNowBasicPlan = newPriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!;

  // Se mudou de plano IA para plano base, desativar agentes
  if (wasAIPlan && isNowBasicPlan) {
    await deactivateAllAIAgents(existingSubscription.userId);
  }

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
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
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
}

async function handlePaymentSucceeded(invoice: any) {
  if (!invoice.subscription) {
    return;
  }

  const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (subscription) {
    let paymentIntentId = "unknown";
    if (invoice.payment_intent) {
      paymentIntentId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent.id;
    }

    await prisma.paymentHistory.create({
      data: {
        userId: subscription.userId,
        stripePaymentId: paymentIntentId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid || 0,
        currency: invoice.currency,
        status: "succeeded",
        description: invoice.description || "Pagamento de assinatura",
      },
    });

    // Verificar se é um pacote adicional de IA
    if (subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!) {
      await prisma.additionalAICredit.create({
        data: {
          userId: subscription.userId,
          quantity: 10,
          used: 0,
          active: true,
          stripePaymentId: paymentIntentId,
          stripeInvoiceId: invoice.id,
        },
      });
    }
  }
}

async function handlePaymentFailed(invoice: any) {
  if (!invoice.subscription) {
    return;
  }

  const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (subscription) {
    let paymentIntentId = "failed";
    if (invoice.payment_intent) {
      paymentIntentId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent.id;
    }

    await prisma.paymentHistory.create({
      data: {
        userId: subscription.userId,
        stripePaymentId: paymentIntentId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due || 0,
        currency: invoice.currency,
        status: "failed",
        description: "Falha no pagamento da assinatura",
      },
    });
  }
}
