"use client";

import { create } from "zustand";
import { createSubscription } from "@/actions/subscription/create-checkout";
import { cancelSubscription } from "@/actions/subscription/cancel";
import { createPortalSession } from "@/actions/subscription/portal";
import { Subscription, AdditionalCalendar } from "@prisma/client";

interface SubscriptionData {
  subscription:
    | (Pick<Subscription, "id" | "status" | "stripePriceId" | "stripeProductId" | "cancelAtPeriodEnd"> & {
        currentPeriodEnd: string;
        trialEnd?: string;
      })
    | null;
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

interface SubscriptionState {
  data: SubscriptionData | null;
  isLoading: boolean;
  error: Error | null;
  lastFetch: number;
  cacheTime: number;
  isFetching: boolean;

  // Ações
  fetchSubscriptionStatus: (userId?: string, force?: boolean) => Promise<void>;
  createSubscription: (priceId: string) => Promise<void>;
  cancelSubscription: () => Promise<{ success: boolean }>;
  createPortalSession: () => Promise<void>;
}

// Função para buscar dados da assinatura via API
async function fetchSubscriptionData(force = false): Promise<SubscriptionData> {
  // Opções de cache para o fetch
  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Usar cache a menos que force seja true
    cache: force ? "no-store" : "force-cache",
    next: {
      // Revalidar a cada 1 hora
      revalidate: 3600,
    },
  };

  const response = await fetch("/api/subscription/status", fetchOptions);

  if (!response.ok) {
    throw new Error(`Erro ao buscar status da assinatura: ${response.status}`);
  }

  return await response.json();
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastFetch: 0,
  cacheTime: 0,
  isFetching: false,

  fetchSubscriptionStatus: async (userId, force = false) => {
    // Se não tiver userId e não estiver forçando, não faz nada
    if (!userId && !force) {
      return;
    }

    const state = get();

    // Se já estiver buscando, não faz nada
    if (state.isFetching) {
      return;
    }

    // Verificar cache no cliente com TTL de 1 hora (3600000ms)
    const now = Date.now();

    // Debounce: evitar múltiplas chamadas em menos de 1 segundo
    if (now - state.lastFetch < 1000 && !force) {
      return;
    }

    try {
      set({ isLoading: true, isFetching: true, error: null });
      const subscriptionData = await fetchSubscriptionData(force);

      set({
        data: subscriptionData,
        lastFetch: now,
        cacheTime: now,
        isLoading: false,
        isFetching: false,
      });
    } catch (err) {
      console.error("Erro ao buscar status da assinatura:", err);
      set({
        error: err as Error,
        isLoading: false,
        isFetching: false,
      });
    }
  },

  createSubscription: async (priceId) => {
    try {
      await createSubscription(priceId);
      // A função createSubscription já faz o redirect
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      throw error;
    }
  },

  cancelSubscription: async () => {
    try {
      await cancelSubscription();
      // Forçar revalidação do cache após cancelar
      await get().fetchSubscriptionStatus(undefined, true);
      return { success: true };
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      throw error;
    }
  },

  createPortalSession: async () => {
    try {
      await createPortalSession();
      // A função createPortalSession já faz o redirect
    } catch (error) {
      console.error("Erro ao criar sessão do portal:", error);
      throw error;
    }
  },
}));
