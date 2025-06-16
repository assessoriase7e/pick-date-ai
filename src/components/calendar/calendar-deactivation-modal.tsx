"use client";

import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { updateCalendar } from "@/actions/calendars/update";
import { useToast } from "@/components/ui/use-toast";

interface CalendarDeactivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendars: Array<{
    id: number;
    name: string | null;
    isActive: boolean;
    collaborator?: {
      name: string;
    } | null;
  }>;
  newLimit: number;
  onComplete: () => void;
}

export function CalendarDeactivationModal({
  open,
  onOpenChange,
  calendars,
  newLimit,
  onComplete,
}: CalendarDeactivationModalProps) {
  const [calendarStates, setCalendarStates] = useState<Record<number, boolean>>(
    calendars.reduce((acc, calendar) => {
      acc[calendar.id] = calendar.isActive;
      return acc;
    }, {} as Record<number, boolean>)
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const activeCount = Object.values(calendarStates).filter(Boolean).length;
  const canConfirm = activeCount <= newLimit;

  const handleToggleCalendar = (calendarId: number) => {
    setCalendarStates(prev => ({
      ...prev,
      [calendarId]: !prev[calendarId]
    }));
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setIsLoading(true);
    try {
      // Atualizar status dos calendários
      const updatePromises = calendars.map(calendar => {
        const newStatus = calendarStates[calendar.id];
        if (newStatus !== calendar.isActive) {
          return updateCalendar({
            id: calendar.id,
            name: calendar.name || "",
            isActive: newStatus,
          });
        }
        return Promise.resolve({ success: true });
      });

      const results = await Promise.all(updatePromises);
      const hasErrors = results.some(result => !result.success);

      if (hasErrors) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao atualizar alguns calendários.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Calendários atualizados com sucesso.",
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating calendars:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToPricing = () => {
    router.push("/pricing");
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={() => {}} // Modal não pode ser fechado
      title="Ajustar Calendários Ativos"
      showFooter={false}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-900 mb-1">
              Limite de calendários reduzido
            </p>
            <p className="text-orange-700">
              Seu plano agora permite apenas <strong>{newLimit} calendários ativos</strong>.
              Selecione quais calendários manter ativos.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Seus Calendários</h4>
            <span className={`text-sm ${
              canConfirm ? 'text-green-600' : 'text-red-600'
            }`}>
              {activeCount}/{newLimit} selecionados
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {calendars.map((calendar) => {
              const displayName = calendar.name || calendar.collaborator?.name || `Calendário ${calendar.id}`;
              
              return (
                <div
                  key={calendar.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{displayName}</p>
                      {calendar.name && calendar.collaborator && (
                        <p className="text-xs text-muted-foreground">
                          Profissional: {calendar.collaborator.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={calendarStates[calendar.id]}
                    onCheckedChange={() => handleToggleCalendar(calendar.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {!canConfirm && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              Você precisa desativar {activeCount - newLimit} calendário(s) para continuar.
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm flex-1">
              <p className="font-medium text-blue-900 mb-2">
                Não quer desativar calendários?
              </p>
              <p className="text-blue-700 mb-3">
                Reative seu plano com IA para ter calendários ilimitados.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToPricing}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className="min-w-24"
          >
            {isLoading ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </ConfirmationDialog>
  );
}