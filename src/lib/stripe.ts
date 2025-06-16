import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

// Stripe product IDs as provided
export const STRIPE_PRODUCTS = {
  BASE_PLAN: "free", // Base plan is free
  PLAN_100: "price_1QZlGJP5zCcNhVJmwrGJhKJy", // 100 attendances
  PLAN_200: "price_1QZlGJP5zCcNhVJmwrGJhKJy", // 200 attendances
  PLAN_300: "price_1QZlGJP5zCcNhVJmwrGJhKJy", // 300 attendances
} as const;

// Plan configurations
export const PLAN_CONFIGS = {
  BASE_PLAN: {
    name: "Agenda Base",
    attendances: 0,
    price: 0,
    features: ["Agenda básica", "Suporte por email"],
    restrictions: {
      files: true,
      aiUsage: true,
      customLinks: true,
      qa: true,
      agents: true,
    },
  },
  PLAN_100: {
    name: "100 Atendimentos IA",
    attendances: 100,
    price: 97,
    features: ["100 atendimentos com IA por mês", "Todas as funcionalidades", "Suporte prioritário"],
    restrictions: {
      files: false,
      aiUsage: false,
      customLinks: false,
      qa: false,
      agents: false,
    },
  },
  PLAN_200: {
    name: "200 Atendimentos IA",
    attendances: 200,
    price: 197,
    features: ["200 atendimentos com IA por mês", "Todas as funcionalidades", "Suporte prioritário"],
    restrictions: {
      files: false,
      aiUsage: false,
      customLinks: false,
      qa: false,
      agents: false,
    },
  },
  PLAN_300: {
    name: "300 Atendimentos IA",
    attendances: 300,
    price: 297,
    features: ["300 atendimentos com IA por mês", "Todas as funcionalidades", "Suporte prioritário"],
    restrictions: {
      files: false,
      aiUsage: false,
      customLinks: false,
      qa: false,
      agents: false,
    },
  },
} as const;

export type PlanType = keyof typeof STRIPE_PRODUCTS;
export type PlanConfig = (typeof PLAN_CONFIGS)[PlanType];

// Helper function to get plan config by product ID
export function getPlanByProductId(productId: string): PlanType | null {
  const entry = Object.entries(STRIPE_PRODUCTS).find(([, id]) => id === productId);
  return entry ? (entry[0] as PlanType) : null;
}

// Helper function to check if user has access to a feature
export function hasFeatureAccess(planType: PlanType, feature: keyof PlanConfig["restrictions"]): boolean {
  const config = PLAN_CONFIGS[planType];
  return !config.restrictions[feature];
}
