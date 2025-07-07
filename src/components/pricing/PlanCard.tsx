"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Plan, AddonPlan, AnyPlan, SubscriptionInfo } from "@/types/subscription";
import { usePlanLogic } from "@/hooks/use-plan-logic";

interface PlanCardProps {
  plan: AnyPlan;
  subscription?: SubscriptionInfo | null;
  onSubscribe?: (priceId: string) => void;
  showButton?: boolean;
  isLandingPage?: boolean;
  variant?: "default" | "addon";
}

export function PlanCard({
  plan,
  subscription,
  onSubscribe,
  showButton = true,
  isLandingPage = false,
  variant = "default",
}: PlanCardProps) {
  const { isCurrentPlan, getButtonText, isButtonDisabled } = usePlanLogic({ subscription });
  
  const isAddon = variant === "addon" || plan.planType === "addon";
  const isRecommended = "recommended" in plan && plan.recommended;
  const discount = "discount" in plan ? plan.discount : undefined;
  
  const currentPlan = isCurrentPlan(plan.priceId);
  const buttonText = getButtonText(plan, isAddon);
  const buttonDisabled = isButtonDisabled(plan, isAddon);

  const handleClick = () => {
    if (onSubscribe && !currentPlan && !buttonDisabled) {
      onSubscribe(plan.priceId);
    }
  };

  return (
    <Card
      className={`relative flex flex-col h-full transition-all duration-200 ${
        isRecommended 
          ? "border-primary ring-2 ring-primary/20 scale-105" 
          : "border-border hover:border-primary/50"
      } ${
        isAddon ? "bg-muted/30" : ""
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Recomendado
          </Badge>
        </div>
      )}

      {discount && !isRecommended && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-500 text-white">
            {discount}
          </Badge>
        </div>
      )}

      {isAddon && (
        <div className="absolute -top-3 left-4">
          <Badge variant="outline" className="bg-background">
            Add-on
          </Badge>
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
          {discount && (
            <div className="text-green-500 text-sm font-medium mt-1">{discount}</div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className={`space-y-2 flex-1 mb-6 ${isLandingPage ? "text-sm" : "text-sm"}`}>
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
            disabled={buttonDisabled}
            className={`w-full ${
              isRecommended
                ? "bg-primary hover:bg-primary/90"
                : "bg-accent hover:bg-accent/90 text-foreground dark:text-background"
            } ${
              buttonDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            size="lg"
          >
            {currentPlan ? "Plano Atual" : buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
