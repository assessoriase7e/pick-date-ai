import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { StripeWebhookEvent } from "@/actions/stripe/webhook-types";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "@/actions/stripe/subscription-handlers";
import {
  handlePaymentSucceeded,
  handlePaymentFailed,
  handlePaymentIntentSucceeded,
  handleCheckoutSessionCompleted,
} from "@/actions/stripe/payment-handlers";

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
        } else {
          // Usar a nova função para processar pagamentos únicos
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }

      case StripeWebhookEvent.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

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
