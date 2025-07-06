"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { useSubscription } from "@/store/subscription-store";

export default function SubscriptionStatus() {
  const router = useRouter();
  const { data, isLoading, fetchSubscription } = useSubscription();

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleClick = () => {
    router.push("/pricing");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
        title="Erro ao carregar status da assinatura"
      >
        <span className="text-red-600 text-sm font-bold">!</span>
      </button>
    );
  }

  // Usuário com acesso premium (assinatura ativa ou trial)
  if (data.canAccessPremiumFeatures) {
    if (data.isSubscriptionActive) {
      return (
        <button
          onClick={handleClick}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors"
          title="Assinatura ativa"
        >
          <Crown className="w-4 h-4 text-yellow-600" />
        </button>
      );
    }

    if (data.isTrialActive) {
      return (
        <button
          onClick={handleClick}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          title={`Trial: ${data.trialDaysRemaining} dias restantes`}
        >
          <span className="text-blue-600 text-xs font-bold">
            {data.trialDaysRemaining}
          </span>
        </button>
      );
    }
  }

  // Usuário sem acesso premium
  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
      title="Sem assinatura ativa"
    >
      <span className="text-red-600 text-sm font-bold">!</span>
    </button>
  );
}
