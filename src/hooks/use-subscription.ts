import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import { useCallback } from "react";

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    stripePriceId: string;
    stripeProductId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  } | null;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  canAccessPremiumFeatures: boolean;
  trialDaysRemaining?: number;
  hasRemainingCredits: boolean;
  aiCreditsInfo?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSubscription() {
  const { user } = useUser();

  const { data, error, mutate } = useSWR<SubscriptionData>(user ? `/api/subscription/status` : null, fetcher, {
    refreshInterval: 24 * 60 * 60 * 1000, // 24 horas
    revalidateOnFocus: false,
  });

  const createSubscription = useCallback(async (priceId: string) => {
    const response = await fetch("/api/subscription/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  }, []);

  const cancelSubscription = useCallback(async () => {
    const response = await fetch("/api/subscription/cancel", {
      method: "POST",
    });

    const result = await response.json();

    if (result.success) {
      mutate();
    }

    return result;
  }, [mutate]);

  const createPortalSession = useCallback(async () => {
    const response = await fetch("/api/subscription/portal", {
      method: "POST",
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  }, []);

  return {
    subscription: data?.subscription,
    isTrialActive: data?.isTrialActive ?? false,
    isSubscriptionActive: data?.isSubscriptionActive ?? false,
    canAccessPremiumFeatures: data?.canAccessPremiumFeatures ?? false,
    trialDaysRemaining: data?.trialDaysRemaining ?? 0,
    hasRemainingCredits: data?.hasRemainingCredits ?? true,
    aiCreditsInfo: data?.aiCreditsInfo,
    isLoading: !error && !data,
    error,
    createSubscription,
    cancelSubscription,
    createPortalSession,
    refresh: mutate,
  };
}
