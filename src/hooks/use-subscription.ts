"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSubscriptionStore } from "@/store/subscription-store";

export function useSubscription() {
  const { user } = useUser();
  const {
    data,
    isLoading,
    error,
    fetchSubscriptionStatus,
    createSubscription,
    cancelSubscription,
    createPortalSession,
  } = useSubscriptionStore();

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionStatus(user.id);
    }
  }, [user?.id, fetchSubscriptionStatus]);

  return {
    subscription: data?.subscription,
    isTrialActive: data?.isTrialActive || false,
    isSubscriptionActive: data?.isSubscriptionActive || false,
    canAccessPremiumFeatures: data?.canAccessPremiumFeatures || false,
    trialDaysRemaining: data?.trialDaysRemaining || 0,
    hasRemainingCredits: data?.hasRemainingCredits ?? true,
    aiCreditsInfo: data?.aiCreditsInfo,
    additionalCalendars: data?.additionalCalendars || [],
    isLoading,
    error,
    refetch: () => fetchSubscriptionStatus(user?.id, true),
    createSubscription,
    cancelSubscription,
    createPortalSession,
  };
}
