"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { PricingCards } from "@/components/pricing/PricingCards";

interface PricingPageContentProps {
  plans: any[];
  additionalCalendarPlan: any;
  additionalAiPlan: any;
}

export function PricingPageContent({ plans, additionalCalendarPlan, additionalAiPlan }: PricingPageContentProps) {
  const { createSubscription, subscription } = useSubscription();

  const handleSubscribe = async (productId: string) => {
    try {
      await createSubscription(productId);
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
    }
  };

  const AdditionalCard = ({ plan }: { plan: any }) => {
    // Verificar se o plano adicional já está ativo
    const isCurrentPlan = subscription?.stripeProductId === plan.productId;
    
    return (
      <Card className="border-border hover:border-primary/50 transition-colors">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          <CardDescription className="text-sm">{plan.description}</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">{plan.price}</span>
            <span className="text-muted-foreground text-sm">{plan.period}</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-2 flex-1 mb-6">
            {plan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handleSubscribe(plan.productId)}
            disabled={isCurrentPlan}
            className={`w-full bg-accent hover:bg-accent/90 text-foreground dark:text-background ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
            size="lg"
          >
            {isCurrentPlan ? "Plano Atual" : "Adicionar ao Plano"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <PricingCards plans={plans} />

      {/* Seção de Produtos Adicionais */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2">Produtos Adicionais</h3>
          <p className="text-muted-foreground">Expanda seu plano com recursos extras</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdditionalCard plan={additionalCalendarPlan} />
          <AdditionalCard plan={additionalAiPlan} />
        </div>
      </div>
    </div>
  );
}
