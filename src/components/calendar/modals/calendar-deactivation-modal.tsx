"use client";

import { useState, useEffect } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calendar } from "lucide-react";
import { updateCalendar } from "@/actions/calendars/update";
import { Calendar as CalendarType } from "@prisma/client";
import { toast } from "sonner";

interface CalendarDeactivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendars: CalendarType[];
  excessCount: number;
  onSuccess?: () => void;
}

export function CalendarDeactivationModal({
  open,
  onOpenChange,
  calendars,
  excessCount,
  onSuccess,
}: CalendarDeactivationModalProps) {
  const [selectedCalendars, setSelectedCalendars] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const activeCalendars = calendars.filter((cal) => cal.isActive);
  const canConfirm = selectedCalendars.size >= excessCount;

  useEffect(() => {
    if (open) {
      // Auto-selecionar os calendários mais antigos por padrão
      const oldestCalendars = activeCalendars
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, excessCount)
        .map((cal) => cal.id);
      setSelectedCalendars(new Set(oldestCalendars));
    }
  }, [open, excessCount, activeCalendars]);

  const handleToggleCalendar = (calendarId: number) => {
    const newSelected = new Set(selectedCalendars);
    if (newSelected.has(calendarId)) {
      newSelected.delete(calendarId);
    } else {
      newSelected.add(calendarId);
    }
    setSelectedCalendars(newSelected);
  };

  const handleConfirm = async () => {
    if (selectedCalendars.size < excessCount) {
      toast.info("Você deve selecionar pelo menos ${excessCount} calendário(s) para desativar.");
      return;
    }

    setIsLoading(true);
    try {
      // Desativar calendários selecionados
      const promises = Array.from(selectedCalendars).map((calendarId) => {
        const calendar = calendars.find((cal) => cal.id === calendarId);
        if (calendar) {
          return updateCalendar({
            id: calendarId,
            name: calendar.name || "",
            collaboratorId: calendar.collaboratorId || undefined,
            isActive: false,
            accessCode: calendar.accessCode,
          });
        }
        return Promise.resolve({ success: false });
      });

      const results = await Promise.all(promises);
      const failedCount = results.filter((result) => !result.success).length;

      if (failedCount === 0) {
        toast(`${selectedCalendars.size} calendário(s) foram desativados com sucesso.`);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast(`${failedCount} calendário(s) não puderam ser desativados.`);
      }
    } catch (error) {
      console.error("Error deactivating calendars:", error);
      toast(`Falha ao desativar calendários. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Desativar Calendários Excedentes"
      showFooter={false}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Limite de calendários excedido</p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Você precisa desativar pelo menos {excessCount} calendário(s) para estar dentro do limite.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Selecione os calendários para desativar:</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {activeCalendars.map((calendar) => (
              <div
                key={calendar.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{calendar.name || `Calendário ${calendar.id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Criado em {calendar.createdAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={selectedCalendars.has(calendar.id)}
                  onCheckedChange={() => handleToggleCalendar(calendar.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedCalendars.size} de {excessCount} calendário(s) selecionado(s)
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm || isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Desativando..." : "Desativar Selecionados"}
            </Button>
          </div>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
