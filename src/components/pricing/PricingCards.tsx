"use client";

import { createSubscription } from "@/store/subscription-store";
import { Subscription } from "@prisma/client";
import { Plan } from "@/types/subscription";
import { PlanCard } from "./PlanCard";

interface PricingCardsProps {
  plans: Plan[];
  subscription: Subscription | null;
}

export function PricingCards({ plans, subscription }: PricingCardsProps) {
  const handleSubscribe = async (productId: string) => {
    try {
      await createSubscription(productId);
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Planos Simples e Transparentes
          </h1>
          <p className="text-lg leading-8 text-muted-foreground mb-6">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              subscription={subscription}
              onSubscribe={handleSubscribe}
              isLandingPage={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
