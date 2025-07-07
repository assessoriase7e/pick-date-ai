"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, AlertTriangle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortalSession } from "@/store/subscription-store";
import { SubscriptionData } from "@/types/subscription";
import { useState } from "react";

interface AdditionalAISettingsProps {
  subscriptionData: SubscriptionData;
}

export function AdditionalAISettings({ subscriptionData }: AdditionalAISettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o usuário tem pacotes adicionais de IA
  const hasAdditionalAI = subscriptionData.additionalAICredits && 
    subscriptionData.additionalAICredits.length > 0 &&
    subscriptionData.additionalAICredits.some(credit => credit.remaining > 0);

  // Verificar se a assinatura está ativa baseado no status da assinatura
  const isSubscriptionActive = subscriptionData.subscription?.status === "active";

  const totalAdditionalCredits = subscriptionData.additionalAICredits?.reduce(
    (total, credit) => total + credit.remaining, 0
  ) || 0;
  const handleManageAIPackages = async () => {
    if (!isSubscriptionActive) {
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

  const handleAddAIPackage = async () => {
    if (!isSubscriptionActive) {
      router.push("/pricing");
    } else {
      router.push("/pricing#additional-ai");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Pacotes Adicionais de IA
        </CardTitle>
        <CardDescription>Gerencie seus pacotes adicionais de créditos de IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasAdditionalAI ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Pacotes Adicionais de IA Ativos</h4>
                <p className="text-sm text-muted-foreground">
                  {totalAdditionalCredits} créditos adicionais disponíveis
                </p>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            {subscriptionData.additionalAICredits?.map((credit) => (
              <div key={credit.id} className="text-sm text-muted-foreground border rounded p-2">
                <p>Pacote: {credit.remaining} de {credit.quantity} créditos restantes</p>
                <p>Expira em: {new Date(credit.expiresAt).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Brain className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Você não possui pacotes adicionais de IA ativos.
            </p>
          </div>
        )}
        
        {/* Mostrar aviso de assinatura necessária apenas se não houver assinatura ativa */}
        {!isSubscriptionActive && (
          <div className="p-3 bg-yellow-50 rounded-lg mt-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Assinatura necessária</p>
                <p>Você precisa de uma assinatura ativa para gerenciar pacotes adicionais de IA.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="space-y-2">
        {hasAdditionalAI ? (
          <>
            {/* Botão principal para gerenciar via Stripe */}
            <Button onClick={handleManageAIPackages} className="w-full" disabled={isLoading || !isSubscriptionActive}>
              <Settings className="h-4 w-4 mr-2" />
              {isLoading ? "Carregando..." : "Gerenciar via Stripe"}
            </Button>

            {/* Botão secundário para adicionar mais pacotes */}
            <Button onClick={handleAddAIPackage} variant="outline" className="w-full" disabled={isLoading || !isSubscriptionActive}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mais Pacotes
            </Button>
          </>
        ) : (
          <Button onClick={handleAddAIPackage} className="w-full" variant="default" disabled={isLoading}>
            {isSubscriptionActive ? (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pacote de IA
              </>
            ) : (
              "Ver Planos"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
