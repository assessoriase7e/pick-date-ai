"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSubscription } from "@/store/subscription-store";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const PREMIUM_PATHS = ["/files", "/ai-usage", "/links", "/questions", "/agents"];

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, fetchSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isChecking && data) {
      const isPremiumPath = PREMIUM_PATHS.some(path => pathname.startsWith(path));
      
      if (isPremiumPath && !data.canAccessPremiumFeatures) {
        // Se a assinatura existe mas está inativa, redirecionar para pending
        if (data.subscription && !data.isSubscriptionActive) {
          router.push("/payment/pending");
        } else {
          // Caso contrário, redirecionar para pricing
          router.push("/pricing");
        }
      }
    }
  }, [isChecking, data, pathname, router]);

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não conseguiu carregar os dados, mostrar erro
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao verificar status da assinatura</p>
          <button 
            onClick={() => fetchSubscription()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
