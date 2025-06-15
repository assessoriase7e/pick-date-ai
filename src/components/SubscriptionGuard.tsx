"use client";

import { useEffect } from "react";
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
  const { subscription, isTrialActive, isSubscriptionActive, isLoading } = useSubscription();

  useEffect(() => {
    if (!user || isLoading) return;

    // Se trial expirou e não tem assinatura ativa
    if (!isTrialActive && !isSubscriptionActive) {
      router.push("/pricing");
      return;
    }

    // Se tem assinatura mas está inativa
    if (subscription && !["active", "trialing"].includes(subscription.status)) {
      router.push("/payment/pending");
      return;
    }
  }, [pathname, user, subscription, isTrialActive, isSubscriptionActive, isLoading, router]);

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
