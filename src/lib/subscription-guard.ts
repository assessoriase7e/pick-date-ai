import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { STRIPE_PRODUCTS } from "@/lib/stripe";
import { isLifetimeUser } from "@/lib/lifetime-user";
import { clerkClient } from "@clerk/nextjs/server";

const RESTRICTED_PATHS = ["/files", "/ai-usage", "/links", "/questions", "/agents"];

/**
 * Verifica se um usuário específico tem acesso a recursos premium
 * @param userId - ID do usuário a ser verificado
 * @returns Promise<boolean> - true se tem acesso, false caso contrário
 */
export async function checkUserSubscriptionAccess(userId: string): Promise<boolean> {
  try {
    // Buscar usuário no Clerk para verificar se é lifetime
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const privateMetadata = clerkUser.privateMetadata as any;
    
    if (privateMetadata?.lifetime === true) {
      return true;
    }

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return false;
    }

    // Verificar período de teste (3 dias)
    const trialEndDate = new Date(user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const isTrialActive = new Date() < trialEndDate;

    // Se trial ainda está ativo, permitir acesso
    if (isTrialActive) {
      return true;
    }

    // Verificar assinatura
    const subscription = user.subscription;
    return subscription ? ["active", "trialing"].includes(subscription.status) : false;
  } catch (error) {
    console.error("Erro ao verificar acesso de assinatura do usuário:", error);
    return false;
  }
}

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

    // Verificar período de teste (7 dias)
    const trialEndDate = new Date(user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7); // Alterado de 3 para 7 dias
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
