"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState, useRef } from "react";
import { getSubscriptionStatus } from "@/actions/subscription/get-status";
import { createSubscription } from "@/actions/subscription/create-checkout";
import { cancelSubscription } from "@/actions/subscription/cancel";
import { createPortalSession } from "@/actions/subscription/portal";
import { Subscription, AdditionalCalendar } from "@prisma/client";

interface SubscriptionData {
  subscription: (Pick<Subscription, 'id' | 'status' | 'stripePriceId' | 'stripeProductId' | 'cancelAtPeriodEnd'> & {
    currentPeriodEnd: string;
    trialEnd?: string;
  }) | null;
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
  additionalCalendars?: AdditionalCalendar[];
}

export function useSubscription() {
  const { user } = useUser();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user || fetchingRef.current) {
      setIsLoading(false);
      return;
    }

    // Debounce: evitar múltiplas chamadas em menos de 1 segundo
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchRef.current = now;
      setIsLoading(true);
      setError(null);
      const subscriptionData = await getSubscriptionStatus();
      setData(subscriptionData);
    } catch (err) {
      setError(err as Error);
      console.error("Erro ao buscar status da assinatura:", err);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]); // Usar apenas user.id como dependência

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const handleCreateSubscription = useCallback(async (priceId: string) => {
    try {
      await createSubscription(priceId);
      // A função createSubscription já faz o redirect, então não precisamos fazer mais nada
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      throw error;
    }
  }, []);

  const handleCancelSubscription = useCallback(async () => {
    try {
      await cancelSubscription();
      // Recarregar os dados após cancelar
      await fetchSubscriptionStatus();
      return { success: true };
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      throw error;
    }
  }, [fetchSubscriptionStatus]);

  const handleCreatePortalSession = useCallback(async () => {
    try {
      await createPortalSession();
      // A função createPortalSession já faz o redirect
    } catch (error) {
      console.error("Erro ao criar sessão do portal:", error);
      throw error;
    }
  }, []);

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
    refetch: fetchSubscriptionStatus,
    createSubscription: handleCreateSubscription,
    cancelSubscription: handleCancelSubscription,
    createPortalSession: handleCreatePortalSession,
  };
}
