"use client";

import { create } from "zustand";
import { SubscriptionData } from "@/types/subscription";
import { getSubscriptionStatus } from "@/actions/subscription/get-subscription-status";
import { createSubscription as createSubscriptionAction } from "@/actions/subscription/create-subscription";
import { cancelSubscription as cancelSubscriptionAction } from "@/actions/subscription/cancel-subscription";
import { createPortalSession as createPortalSessionAction } from "@/actions/subscription/create-portal-session";
import { cancelBasePlan as cancelBasePlanAction } from "@/actions/subscription/cancel-base-plan";

interface SubscriptionStore {
  data: SubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
}

export const useSubscription = create<SubscriptionStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSubscriptionStatus();

      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false });
    }
  },
}));

// Export the action functions for use in components
// Adicionar nova função para pagamentos únicos
export const createOneTimePayment = async (priceId: string) => {
  console.log(priceId);

  try {
    const response = await fetch("/api/payment/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar pagamento");
    }

    const result = await response.json();
    if (result.url) {
      window.location.href = result.url;
    }
    return result;
  } catch (error) {
    console.error("Erro ao criar pagamento único:", error);
    throw error;
  }
};

export const createSubscription = async (priceId: string) => {
  // Verificar se é um produto de pagamento único
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_AI) {
    return createOneTimePayment(priceId);
  }
  const result = await createSubscriptionAction(priceId);
  if (result.url) {
    window.location.href = result.url;
  }
  return result;
};

export const cancelSubscription = async () => {
  const result = await cancelSubscriptionAction();
  // Refresh subscription data after cancellation
  useSubscription.getState().fetchSubscription();
  return result;
};

export const cancelBasePlan = async () => {
  const result = await cancelBasePlanAction();
  // Refresh subscription data after cancellation
  useSubscription.getState().fetchSubscription();
  return result;
};

export const createPortalSession = async () => {
  const result = await createPortalSessionAction();
  if (result.url) {
    window.location.href = result.url;
  }
  return result;
};
