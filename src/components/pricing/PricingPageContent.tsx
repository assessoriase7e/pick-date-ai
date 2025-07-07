"use client";

import { createSubscription } from "@/store/subscription-store";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PlanCard } from "@/components/pricing/PlanCard";
import { SubscriptionData, Plan, AddonPlan } from "@/types/subscription";
import { PRICING_TEXTS } from "@/constants/pricing";
import { Separator } from "../ui/separator";

interface PricingPageContentProps {
  plans: Plan[];
  additionalPlans: AddonPlan[];
  subscriptionData: SubscriptionData | null;
}

export function PricingPageContent({ plans, additionalPlans, subscriptionData }: PricingPageContentProps) {
  const subscription = subscriptionData?.subscription;

  const handleSubscribe = async (priceId: string) => {
    try {
      await createSubscription(priceId);
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
    }
  };

  return (
    <div className="space-y-5">
      {/* Planos Principais */}
      <PricingCards plans={plans} subscription={subscription} />
      <Separator />
      {/* Planos Adicionais */}
      <div className="container mx-auto px-4" id="additional-plans">
        <div className="mx-auto max-w-2xl text-center mb-5">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_TEXTS.additionalPlansTitle}</h2>
          <p className="text-lg leading-8 text-muted-foreground">{PRICING_TEXTS.additionalPlansSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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

        {/* Adicionar nota sobre validade dos créditos */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">{PRICING_TEXTS.aiCreditsNote}</p>
        </div>
      </div>
    </div>
  );
}
