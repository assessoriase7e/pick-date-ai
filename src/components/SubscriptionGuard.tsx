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
  const { subscription, canAccessPremiumFeatures, isLoading } = useSubscription();

  useEffect(() => {
    if (!user || isLoading) return;

    // Usar canAccessPremiumFeatures que já inclui verificação de lifetime users
    if (!canAccessPremiumFeatures) {
      router.push("/pricing");
      return;
    }

    // Se tem assinatura mas está inativa (não se aplica a lifetime users)
    if (subscription && !["active", "trialing"].includes(subscription.status)) {
      router.push("/payment/pending");
      return;
    }
  }, [pathname, user, subscription, canAccessPremiumFeatures, isLoading, router]);

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
