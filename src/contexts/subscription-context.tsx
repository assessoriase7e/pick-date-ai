"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSubscription as useSubscriptionHook } from "@/hooks/use-subscription";
import { Subscription, AdditionalCalendar } from "@prisma/client";

interface SubscriptionContextType {
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
  additionalCalendars: AdditionalCalendar[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createSubscription: (priceId: string) => Promise<void>;
  cancelSubscription: () => Promise<{ success: boolean }>;
  createPortalSession: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscriptionData = useSubscriptionHook();

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}