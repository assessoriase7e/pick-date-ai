"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { useUser } from "@clerk/nextjs";

const RESTRICTED_PATHS = ["/files", "/ai-usage", "/links", "/questions", "/agents"];

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { subscription, canAccessPremiumFeatures, isLoading } = useSubscription();
  const hasRedirected = useRef(false);

  // Memoizar se a rota requer premium
  const requiresPremium = useMemo(() => {
    return RESTRICTED_PATHS.some((path) => pathname.startsWith(path));
  }, [pathname]);

  useEffect(() => {
    // Reset redirect flag when pathname changes
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!user || isLoading || hasRedirected.current) return;

    if (!requiresPremium) return;

    // Se não pode acessar recursos premium, redirecionar para pricing
    if (!canAccessPremiumFeatures) {
      hasRedirected.current = true;
      router.push("/pricing");
      return;
    }

    // Se tem assinatura mas está inativa (não se aplica a lifetime users)
    if (subscription && !canAccessPremiumFeatures && !["active", "trialing"].includes(subscription.status)) {
      hasRedirected.current = true;
      router.push("/payment/pending");
      return;
    }
  }, [subscription?.status, canAccessPremiumFeatures, requiresPremium, router, user, isLoading]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
