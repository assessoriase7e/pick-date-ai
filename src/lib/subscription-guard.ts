import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { STRIPE_PRODUCTS } from "@/lib/stripe";

const RESTRICTED_PATHS = ["/files", "/ai-usage", "/links", "/questions", "/agents"];

export async function checkSubscriptionAccess(pathname: string) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // Verificar se a rota requer assinatura premium
  const requiresPremium = RESTRICTED_PATHS.some((path) => pathname.startsWith(path));

  if (!requiresPremium) {
    return null; // Acesso liberado
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return redirect("/sign-in");
  }

  // Verificar período de teste (3 dias)
  const trialEndDate = new Date(user.createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + 3);
  const isTrialActive = new Date() < trialEndDate;

  if (isTrialActive) {
    return null; // Acesso liberado durante trial
  }

  // Verificar assinatura ativa
  const subscription = user.subscription;

  if (!subscription) {
    return redirect("/pricing");
  }

  // Verificar se não é plano base
  if (subscription.stripeProductId === STRIPE_PRODUCTS.BASE_PLAN) {
    return redirect("/pricing");
  }

  // Verificar status da assinatura
  if (!["active", "trialing"].includes(subscription.status)) {
    return redirect("/payment/pending");
  }

  return null; // Acesso liberado
}
