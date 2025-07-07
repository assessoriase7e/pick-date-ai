"use client";

import { createSubscription } from "@/store/subscription-store";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PlanCard } from "@/components/pricing/PlanCard";
import { SubscriptionData, Plan, AddonPlan } from "@/types/subscription";
import { PRICING_TEXTS } from "@/constants/pricing";

interface PricingPageContentProps {
  plans: Plan[];
  additionalPlans: AddonPlan[];
  subscriptionData: SubscriptionData | null;
}

export function PricingPageContent({
  plans,
  additionalPlans,
  subscriptionData,
}: PricingPageContentProps) {
  const subscription = subscriptionData?.subscription;

  const handleSubscribe = async (priceId: string) => {
    try {
      await createSubscription(priceId);
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
    }
  };

  return (
    <div className="space-y-16">
      {/* Planos Principais */}
      <PricingCards plans={plans} subscription={subscription} />

      {/* Produtos Adicionais */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2">
            {PRICING_TEXTS.additionalPlansTitle}
          </h3>
          <p className="text-muted-foreground">
            {PRICING_TEXTS.additionalPlansSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              subscription={subscription}
              onSubscribe={handleSubscribe}
              variant="addon"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
