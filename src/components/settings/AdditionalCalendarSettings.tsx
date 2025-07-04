'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { useCalendarLimits } from '@/hooks/use-calendar-limits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus } from 'lucide-react';

export function AdditionalCalendarSettings() {
  const { subscription, createPortalSession, isLoading } = useSubscription();
  const { hasAdditionalCalendars } = useCalendarLimits();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendários Adicionais</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendários Adicionais
        </CardTitle>
        <CardDescription>
          Gerencie seus calendários extras
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasAdditionalCalendars ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Calendários Extras</p>
                  <p>Você possui calendários adicionais ativos. Cancele quando quiser.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Plus className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-800">
                <p className="font-medium">Sem Calendários Adicionais</p>
                <p>Você não possui calendários adicionais. Adicione mais calendários ao seu plano.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={createPortalSession}
          className="w-full"
        >
          {hasAdditionalCalendars ? "Gerenciar Calendários" : "Adicionar Calendários"}
        </Button>
      </CardFooter>
    </Card>
  );
}