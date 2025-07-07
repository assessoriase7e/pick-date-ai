"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Plan } from "@/types/subscription";
import { Subscription } from "@prisma/client";

interface PlanCardProps {
  plan: Plan;
  subscription?: Subscription | null;
  onSubscribe?: (productId: string) => void;
  showButton?: boolean;
  buttonText?: string;
  isLandingPage?: boolean;
}

export function PlanCard({ 
  plan, 
  subscription, 
  onSubscribe, 
  showButton = true, 
  buttonText, 
  isLandingPage = false 
}: PlanCardProps) {
  // Verificar se é o plano atual (apenas para tela de preços)
  const isCurrentPlan = !isLandingPage && subscription?.stripePriceId === plan.productId;
  
  const handleClick = () => {
    if (onSubscribe && !isCurrentPlan) {
      onSubscribe(plan.productId);
    }
  };

  return (
    <Card
      className={`relative flex flex-col h-full ${
        plan.recommended ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border"
      }`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
            Recomendado
          </span>
        </div>
      )}

      {plan.discount && !plan.recommended && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {plan.discount}
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className={isLandingPage ? "text-2xl mt-5" : "text-xl font-bold"}>
          {plan.name}
        </CardTitle>
        <CardDescription className={isLandingPage ? "text-xs" : "text-sm"}>
          {plan.description}
        </CardDescription>
        <div className="mt-4">
          <span className={isLandingPage ? "text-4xl font-bold" : "text-3xl font-bold"}>
            {plan.price}
          </span>
          <span className="text-muted-foreground text-sm">{plan.period}</span>
          {plan.discount && (
            <div className="text-green-500 text-sm font-medium mt-1">{plan.discount}</div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className={`space-y-2 flex-1 mb-6 ${isLandingPage ? 'text-sm' : 'text-sm'}`}>
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {showButton && (
          <Button
            onClick={handleClick}
            disabled={isCurrentPlan}
            className={`w-full ${
              plan.recommended
                ? "bg-primary hover:bg-primary/90"
                : "bg-accent hover:bg-accent/90 text-foreground dark:text-background"
            } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
            size="lg"
          >
            {isCurrentPlan 
              ? "Plano Atual" 
              : buttonText || (isLandingPage ? "Teste 3 Dias Grátis" : "Assinar Plano")
            }
          </Button>
        )}
      </CardContent>
    </Card>
  );
}