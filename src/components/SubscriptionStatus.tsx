"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Bot, Star } from "lucide-react";
import { useSubscription, createSubscription } from "@/store/subscription-store";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { STRIPE_PRICE_IDS } from "@/constants/pricing";

export default function SubscriptionStatus() {
  const router = useRouter();
  const { data, isLoading, fetchSubscription } = useSubscription();

  // Modificar o useEffect para evitar requisições desnecessárias
  useEffect(() => {
    // Verificar se já temos dados antes de fazer a requisição
    if (!data && !isLoading) {
      fetchSubscription();
    }
  }, [fetchSubscription, data, isLoading]);

  const handleClick = async () => {
    // Se o usuário já tem uma assinatura ativa, redirecionar para configurações
    if (data?.isSubscriptionActive) {
      router.push("/config");
    } else {
      // Se não tem assinatura, redirecionar diretamente para o checkout do Stripe
      try {
        await createSubscription(STRIPE_PRICE_IDS.basic);
      } catch (error) {
        console.error("Erro ao criar assinatura:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Button
        onClick={handleClick}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors border-[1px] border-red-300"
        title="Erro ao carregar status da assinatura"
      >
        <span className="text-red-600 text-sm font-bold">!</span>
      </Button>
    );
  }
  
  // Verificar se é usuário lifetime
  // Usuários lifetime têm isSubscriptionActive = true, mas podem não ter um objeto subscription
  const isLifetimeUser = data.isSubscriptionActive && !data.subscription;

  // Se for usuário lifetime, mostrar ícone especial
  if (isLifetimeUser) {
    return (
      <Button
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          "bg-background hover:bg-yellow-100 border-[1px] border-yellow-400"
        )}
        title="Acesso vitalício"
      >
        <Star className="w-4 h-4 text-yellow-500" />
      </Button>
    );
  }

  // Função para determinar o tipo de plano
  const getPlanInfo = () => {
    const subscription = data.subscription;

    // Se tem assinatura ativa, usar o planType da assinatura
    if (subscription && data.isSubscriptionActive) {
      return {
        planType: subscription.planType,
        planName: subscription.planName,
        isActive: true,
      };
    }

    // Se está em trial mas tem assinatura (período de teste de um plano específico)
    if (subscription && data.isTrialActive) {
      return {
        planType: subscription.planType,
        planName: subscription.planName,
        isActive: true,
        isTrial: true,
      };
    }

    return null;
  };

  const planInfo = getPlanInfo();

  // Se tem plano ativo (assinatura ou trial)
  if (planInfo?.isActive) {
    // Usar o planType em vez de comparar stripePriceId
    const isAIPlan = ["ai100", "ai200", "ai300"].includes(planInfo.planType);
    const isBasicPlan = planInfo.planType === "basic";

    if (isAIPlan) {
      // Plano IA: ícone de robô com borda accent
      return (
        <Button
          onClick={handleClick}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
            "bg-background hover:bg-accent/10 border-[1px] border-accent"
          )}
          title={
            planInfo.isTrial
              ? `Trial: ${planInfo.planName} - ${data.trialDaysRemaining} dias restantes`
              : `Plano ativo: ${planInfo.planName}`
          }
        >
          <Bot className="w-4 h-4 text-accent" />
        </Button>
      );
    }

    if (isBasicPlan) {
      // Plano Base: ícone de agenda com borda primary
      return (
        <Button
          onClick={handleClick}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
            "bg-background hover:bg-primary/10 border-[1px] border-primary"
          )}
          title={
            planInfo.isTrial
              ? `Trial: ${planInfo.planName} - ${data.trialDaysRemaining} dias restantes`
              : `Plano ativo: ${planInfo.planName}`
          }
        >
          <Calendar className="w-4 h-4 text-primary" />
        </Button>
      );
    }
  }

  // Trial sem plano específico (trial genérico)
  if (data.isTrialActive && !planInfo) {
    return (
      <Button
        onClick={handleClick}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors border-[1px] border-blue-300"
        title={`Trial: ${data.trialDaysRemaining} dias restantes`}
      >
        <span className="text-blue-600 text-xs font-bold">{data.trialDaysRemaining}</span>
      </Button>
    );
  }

  // Usuário sem acesso premium
  return (
    <Button
      onClick={handleClick}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors border-[1px] border-red-300"
      title="Sem assinatura ativa"
    >
      <span className="text-red-600 text-sm font-bold">!</span>
    </Button>
  );
}
