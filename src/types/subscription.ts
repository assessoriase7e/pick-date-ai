export type PlanType = "basic" | "ai100" | "ai200" | "ai300" | "addon";
export type AddonType = "calendar" | "ai";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

import { Subscription } from "@prisma/client";

export interface SubscriptionInfo {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeProductId: string;
  planName: string;
  planType: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  additionalCalendars: {
    id: string;
    active: boolean;
    expiresAt: string;
  }[];
  additionalAICredits: {
    id: string;
    quantity: number;
    used: number;
    remaining: number;
    expiresAt?: string;
  }[];
}

export interface BasePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  priceId: string;
  features: string[];
  planType: PlanType;
}

export interface Plan extends BasePlan {
  planType: Exclude<PlanType, "addon">;
  isBasic?: boolean;
  recommended?: boolean;
  discount?: string;
}

export interface AddonPlan extends BasePlan {
  planType: "addon";
  addonType: AddonType;
  requiresBasePlan?: boolean;
  requiresAiPlan?: boolean;
}

export type AnyPlan = Plan | AddonPlan;

export type SubscriptionWithRelations = Subscription & {
  user?: {
    id: string;
    email: string;
  };
};
