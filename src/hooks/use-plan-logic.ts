import { useMemo } from "react";
import { Plan, AddonPlan, SubscriptionData, SubscriptionInfo } from "@/types/subscription";
import { STRIPE_PRICE_IDS } from "@/constants/pricing";

interface UsePlanLogicProps {
  subscription: SubscriptionInfo | null;
  subscriptionData?: SubscriptionData | null;
}

export function usePlanLogic({ subscription, subscriptionData }: UsePlanLogicProps) {
  const planLogic = useMemo(() => {
    const isCurrentPlan = (priceId: string) => {
      return subscription?.stripePriceId === priceId;
    };

    const canSubscribeToAddon = (addon: AddonPlan) => {
      if (!subscription || subscription.status !== "active") {
        return false;
      }

      if (addon.requiresBasePlan) {
        return true; // Qualquer plano ativo permite calendário adicional
      }

      if (addon.requiresAiPlan) {
        const aiPriceIds = [
          STRIPE_PRICE_IDS.ai100,
          STRIPE_PRICE_IDS.ai200,
          STRIPE_PRICE_IDS.ai300,
        ];
        return aiPriceIds.includes(subscription.stripePriceId);
      }

      return false;
    };

    const getButtonText = (plan: Plan | AddonPlan, isAddon = false) => {
      if (isCurrentPlan(plan.priceId)) {
        return "Plano Atual";
      }

      if (isAddon && plan.planType === "addon") {
        const addon = plan as AddonPlan;
        if (!subscription || subscription.status !== "active") {
          return "Assine um Plano Primeiro";
        }
        if (!canSubscribeToAddon(addon)) {
          return addon.requiresAiPlan ? "Requer Plano de IA" : "Não Compatível";
        }
        return "Adicionar ao Plano";
      }

      return "Assinar Plano";
    };

    const isButtonDisabled = (plan: Plan | AddonPlan, isAddon = false) => {
      if (isCurrentPlan(plan.priceId)) {
        return true;
      }

      if (isAddon && plan.planType === "addon") {
        return !canSubscribeToAddon(plan as AddonPlan);
      }

      return false;
    };

    return {
      isCurrentPlan,
      canSubscribeToAddon,
      getButtonText,
      isButtonDisabled,
    };
  }, [subscription]);

  return planLogic;
}