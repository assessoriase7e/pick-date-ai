"use client";

import { create } from "zustand";
import { SubscriptionData } from "@/types/subscription";

interface SubscriptionState {
  data: SubscriptionData | null;
  isLoading: boolean;
  error: Error | null;
  fetchSubscription: () => Promise<void>;
}

export const useSubscription = create<SubscriptionState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchSubscription: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/subscription/status");
      if (!response.ok) throw new Error("Falha ao buscar dados da assinatura");
      const data = await response.json();
      set({ data, isLoading: false, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error(String(err)), isLoading: false });
    }
  },
}));

// Funções de ação que chamam as APIs
export async function createSubscription(priceId: string): Promise<void> {
  const response = await fetch("/api/subscription/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao criar assinatura");
  }

  const data = await response.json();
  if (data.url) {
    window.location.href = data.url;
  }
}

export async function cancelSubscription(): Promise<{ success: boolean; message?: string }> {
  const response = await fetch("/api/subscription/cancel", {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao cancelar assinatura");
  }

  return response.json();
}

export async function createPortalSession(): Promise<void> {
  const response = await fetch("/api/subscription/portal", {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao criar sessão do portal");
  }

  const data = await response.json();
  if (data.url) {
    window.location.href = data.url;
  }
}
