"use client";

import { useEffect } from "react";
import { useSubscription } from "@/store/subscription-store";

export function useSubscriptionCheck() {
  const { data, isLoading, fetchSubscription } = useSubscription();

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Verifica se o usuário tem acesso às funcionalidades premium
  const hasActiveSubscription = data?.isSubscriptionActive || false;
  const isInTrialPeriod = data?.isTrialActive || false;
  // Adicionar verificação explícita para usuários lifetime
  const isLifetimeUser = data?.isSubscriptionActive && !data?.subscription;
  const hasAccess = hasActiveSubscription || isInTrialPeriod || isLifetimeUser;

  return {
    hasAccess,
    hasActiveSubscription,
    isInTrialPeriod,
    isLifetimeUser,
    isLoading,
    subscriptionData: data,
  };
}