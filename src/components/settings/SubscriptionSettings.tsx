"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortalSession } from "@/store/subscription-store";
import { SubscriptionData } from "@/types/subscription";

interface SubscriptionSettingsProps {
  subscriptionData: SubscriptionData;
}

export function SubscriptionSettings({ subscriptionData }: SubscriptionSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Extrair os valores do data
  const subscription = subscriptionData?.subscription;
  const isTrialActive = subscriptionData?.isTrialActive || false;
  const isSubscriptionActive = subscriptionData?.isSubscriptionActive || false;
  const additionalCalendars = subscriptionData?.additionalCalendars || [];

  // Não precisamos mais do useEffect para buscar dados, pois agora recebemos via props

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Carregando informações da assinatura...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = () => {
    // Verificar diretamente o status da assinatura primeiro
    if (subscription && subscription.status === "active") {
      return <Badge variant="default">Ativa</Badge>;
    }

    // Verificar a flag isSubscriptionActive como fallback
    if (isSubscriptionActive) {
      return <Badge variant="default">Ativa</Badge>;
    }

    if (isTrialActive) {
      return <Badge variant="secondary">Período de Teste</Badge>;
    }

    if (!subscription) {
      return <Badge variant="destructive">Sem Assinatura</Badge>;
    }

    switch (subscription.status) {
      case "active":
        return <Badge variant="default">Ativa</Badge>;
      case "trialing":
        return <Badge variant="secondary">Teste</Badge>;
      case "past_due":
        return <Badge variant="destructive">Pagamento Pendente</Badge>;
      case "canceled":
        return <Badge variant="outline">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  const getPlanName = (productId: string) => {
    switch (productId) {
      case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_BASIC:
        return "Plano Base";
      case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100:
        return "100 Atendimentos IA";
      case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200:
        return "200 Atendimentos IA";
      case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300:
        return "300 Atendimentos IA";
      case "prod_SV7hWdNkIunsco": // Adicionar o ID específico
        return "Plano Base"; // Ou o nome correto do plano
      default:
        return "Plano Desconhecido";
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription || subscription.status !== "active") {
      router.push("/pricing");
    } else {
      setIsLoading(true);
      try {
        await createPortalSession();
      } catch (error) {
        console.error("Erro ao criar sessão do portal:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gerenciar Assinatura
        </CardTitle>
        <CardDescription>Visualize e gerencie sua assinatura atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {subscription && (isSubscriptionActive || subscription.status === "active") && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Plano:</span>
              <span>{subscription.planName || getPlanName(subscription.stripeProductId)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Próxima cobrança:</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>

            {/* Adicionar esta seção para mostrar calendários adicionais */}
            {additionalCalendars && additionalCalendars.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Calendários adicionais:</span>
                <span>{additionalCalendars.length}</span>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Sua assinatura será cancelada em{" "}
                  {format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </>
        )}

        <div className="pt-4 border-t">
          <Button onClick={handleManageSubscription} className="w-full mb-2">
            {!isSubscriptionActive ? "Ver Planos Disponíveis" : "Gerenciar Assinatura no Stripe"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
