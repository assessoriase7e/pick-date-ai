import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { revalidateSubscriptionCache } from "@/actions/subscription/revalidate-subscription";

export async function handlePaymentSucceeded(invoice: any) {
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
  }

  // Código existente para processar pagamento bem-sucedido

  // Revalidar o cache da assinatura se for relacionado a uma assinatura
  if (invoice.subscription) {
    await revalidateSubscriptionCache();
  }
}

export async function handlePaymentFailed(invoice: any) {
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

  // Código existente para processar falha de pagamento

  // Revalidar o cache da assinatura se for relacionado a uma assinatura
  if (invoice.subscription) {
    await revalidateSubscriptionCache();
  }
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  if (metadata.type === "one_time_payment") {
    const userId = metadata.userId;

    if (!userId) {
      throw new Error("User ID not found in payment metadata");
    }

    // Verificar se já existe um registro para este pagamento
    const existingPayment = await prisma.paymentHistory.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (existingPayment) {
      return;
    }

    // Adicionar histórico de pagamento
    await prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount, // Já em centavos
        currency: paymentIntent.currency,
        status: "succeeded",
        description: "Créditos adicionais de IA - 10 atendimentos",
      },
    });
  }
}

// Nova função para processar checkout.session.completed para pagamentos únicos
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Verificar se é um pagamento único para créditos de IA
  if (session.mode === "payment" && session.metadata?.type === "one_time_payment" && session.metadata?.userId) {
    const paymentIntent = session.payment_intent;
    if (paymentIntent) {
      const pi = await stripe.paymentIntents.retrieve(
        typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id
      );

      // Verificar se já existe um registro para este pagamento
      const existingPayment = await prisma.paymentHistory.findUnique({
        where: { stripePaymentId: pi.id },
      });

      if (existingPayment) {
        return;
      }

      // Adicionar histórico de pagamento
      await prisma.paymentHistory.create({
        data: {
          userId: session.metadata.userId,
          stripePaymentId: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          status: "succeeded",
          description: "Créditos adicionais de IA - 10 atendimentos",
        },
      });
    }
  }
}
