'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdditionalAISettings() {
  const { subscription, createPortalSession, isLoading, isSubscriptionActive } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacotes Adicionais de IA</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Verificar se o usuário tem pacotes adicionais de IA
  const hasAdditionalAI = subscription?.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_10;

  const handleManageAIPackages = () => {
    if (!isSubscriptionActive) {
      router.push('/pricing');
    } else {
      createPortalSession();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Pacotes Adicionais de IA
        </CardTitle>
        <CardDescription>
          Gerencie seus pacotes adicionais de créditos de IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscriptionActive ? (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Assinatura Necessária</p>
                <p>É necessário ter uma assinatura ativa para adquirir pacotes adicionais de IA.</p>
              </div>
            </div>
          </div>
        ) : hasAdditionalAI ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Créditos Adicionais</p>
                  <p>Você possui pacotes adicionais de IA ativos. Estes créditos não expiram mensalmente.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Plus className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-800">
                <p className="font-medium">Sem Pacotes Adicionais</p>
                <p>Você não possui pacotes adicionais de IA. Adicione mais créditos que não expiram mensalmente.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleManageAIPackages}
          className="w-full"
          disabled={!isSubscriptionActive}
        >
          {!isSubscriptionActive ? "Assine um Plano Primeiro" : 
           hasAdditionalAI ? "Gerenciar Pacotes" : "Adicionar Pacote de IA"}
        </Button>
      </CardFooter>
    </Card>
  );
}