"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SubscriptionStatusProps {
  className?: string;
}

export function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const { isTrialActive, isSubscriptionActive, trialDaysRemaining, isLoading } = useSubscription();
  const router = useRouter();

  const handleClick = () => {
    router.push("/pricing");
  };

  if (isLoading) {
    return (
      <div
        className={cn("w-10 h-10 rounded-full bg-muted animate-pulse flex items-center justify-center", className)}
      />
    );
  }

  const getTooltipText = () => {
    if (isSubscriptionActive) {
      return "Assinatura Ativa - Clique para ver planos";
    }
    if (isTrialActive) {
      return `${trialDaysRemaining} dia${trialDaysRemaining !== 1 ? "s" : ""} restante${
        trialDaysRemaining !== 1 ? "s" : ""
      } do período de teste - Clique para ver planos`;
    }
    return "Sem assinatura ativa - Clique para ver planos";
  };

  const getContent = () => {
    if (isSubscriptionActive) {
      return <Crown className="h-5 w-5 text-primary" />;
    }
    if (isTrialActive) {
      return <span className="text-sm font-bold text-primary leading-none ml-[2px]">{trialDaysRemaining}</span>;
    }
    return <span className="text-xs font-bold text-muted-foreground">!</span>;
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={cn(
              "min-w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-2 border-foreground hover:bg-accent transition-colors",
              className
            )}
          >
            {getContent()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-background border border-border">
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
