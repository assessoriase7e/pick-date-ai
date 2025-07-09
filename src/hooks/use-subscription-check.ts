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
  const hasAccess = hasActiveSubscription || isInTrialPeriod;

  return {
    hasAccess,
    hasActiveSubscription,
    isInTrialPeriod,
    isLoading,
    subscriptionData: data,
  };
}