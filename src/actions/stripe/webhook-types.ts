// Enum para tipos de eventos do webhook
export enum StripeWebhookEvent {
  CHECKOUT_SESSION_COMPLETED = "checkout.session.completed",
  SUBSCRIPTION_UPDATED = "customer.subscription.updated",
  SUBSCRIPTION_DELETED = "customer.subscription.deleted",
  INVOICE_PAYMENT_SUCCEEDED = "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED = "invoice.payment_failed",
  PAYMENT_INTENT_SUCCEEDED = "payment_intent.succeeded",
}