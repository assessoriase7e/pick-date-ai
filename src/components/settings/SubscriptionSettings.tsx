'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';

export function SubscriptionSettings() {
  const {
    subscription,
    isTrialActive,
    isSubscriptionActive,
    canAccessPremiumFeatures,
    createPortalSession,
    isLoading
  } = useSubscription();

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
    if (isTrialActive) {
      return <Badge variant="secondary">Período de Teste</Badge>;
    }
    
    if (!subscription) {
      return <Badge variant="destructive">Sem Assinatura</Badge>;
    }
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default">Ativa</Badge>;
      case 'trialing':
        return <Badge variant="secondary">Teste</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Pagamento Pendente</Badge>;
      case 'canceled':
        return <Badge variant="outline">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  const getPlanName = (productId: string) => {
    switch (productId) {
      case 'prod_SUzLvSOK0Lt1Y7':
        return 'Plano Base';
      case 'prod_SUmpaC7TdpCQ1o':
        return '100 Atendimentos IA';
      case 'prod_SUmrqvbECO2fGx':
        return '200 Atendimentos IA';
      case 'prod_SUmsDte555npVd':
        return '300 Atendimentos IA';
      default:
        return 'Plano Desconhecido';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gerenciar Assinatura
        </CardTitle>
        <CardDescription>
          Visualize e gerencie sua assinatura atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          {getStatusBadge()}
        </div>
        
        {subscription && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Plano:</span>
              <span>{getPlanName(subscription.stripeProductId)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Próxima cobrança:</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            
            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Sua assinatura será cancelada em {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            )}
          </>
        )}
        
        <div className="pt-4 border-t">
          <Button
            onClick={createPortalSession}
            className="w-full"
          >
            Gerenciar Assinatura no Stripe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}