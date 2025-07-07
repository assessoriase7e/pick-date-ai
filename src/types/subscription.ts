import { AdditionalCalendar } from "@prisma/client";

export type PlanType = "basic" | "ai100" | "ai200" | "ai300";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

export interface SubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  stripePriceId: string;
  stripeProductId: string;
  planType: PlanType;
  planName: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  trialEnd?: string;
}

export interface AdditionalCalendarInfo {
  id: string;
  active: boolean;
  purchaseDate: string;
  expiresAt: string;
}

export interface SubscriptionData {
  subscription: SubscriptionInfo | null;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  canAccessPremiumFeatures: boolean;
  trialDaysRemaining: number;
  hasRemainingCredits: boolean;
  aiCreditsInfo?: {
    used: number;
    limit: number;
    remaining: number;
  };
  additionalCalendars: AdditionalCalendarInfo[];
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  productId: string;
  planType: PlanType;
  features: string[];
  isBasic?: boolean;
  recommended?: boolean;
  discount?: string;
}
