import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { invalidateSubscriptionCache } from "@/utils/subscription-cache";

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
        console.log(`Unhandled event type: ${event.type}`);
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

  if (!productId) {
    throw new Error("Invalid subscription data: missing product ID");
  }

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    throw new Error("Invalid subscription data: missing customer ID");
  }

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: price.id,
      stripeProductId: productId,
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
      status: subscription.status,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];

  if (!item) {
    throw new Error("Invalid subscription data: missing item");
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    include: {
      user: true
    }
  });

  // Invalidar cache do usuário
  if (updatedSubscription.user) {
    await invalidateSubscriptionCache(updatedSubscription.user.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const deletedSubscription = await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "canceled",
    },
    include: {
      user: true
    }
  });

  // Invalidar cache do usuário
  if (deletedSubscription.user) {
    await invalidateSubscriptionCache(deletedSubscription.user.id);
  }
}

async function checkAndHandleCalendarLimits(userId: string, subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      calendars: {
        where: { isActive: true }
      }
    },
  });

  if (!user) return;

  const currentActiveCalendars = user.calendars.length;
  const newLimit = getCalendarLimit(user.subscription);

  // Se excedeu o limite, desativar calendários mais antigos
  if (currentActiveCalendars > newLimit) {
    const calendarsToDeactivate = user.calendars
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(newLimit);

    await prisma.calendar.updateMany({
      where: {
        id: {
          in: calendarsToDeactivate.map(c => c.id)
        }
      },
      data: {
        isActive: false
      }
    });
  }
}

function getCalendarLimit(subscription: any): number {
  if (!subscription || subscription.status !== "active") {
    return 3;
  }

  const { stripePriceId } = subscription;
  
  if ([
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
  ].includes(stripePriceId)) {
    return Infinity;
  }
  
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!) {
    return 13;
  }
  
  return 3;
}

async function handlePaymentSucceeded(invoice: any) {
  // Correção: verificar se subscription existe e não é null
  if (!invoice.subscription) {
    console.log("Invoice without subscription, skipping payment history creation");
    return;
  }

  const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (subscription) {
    // Correção: verificar se payment_intent existe e não é null
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
  }
}

async function handlePaymentFailed(invoice: any) {
  // Correção: verificar se subscription existe e não é null
  if (!invoice.subscription) {
    console.log("Invoice without subscription, skipping payment history creation");
    return;
  }

  const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (subscription) {
    // Correção: verificar se payment_intent existe e não é null
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
