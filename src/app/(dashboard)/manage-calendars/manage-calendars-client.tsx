"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calendar, ArrowLeft } from "lucide-react";
import { updateCalendar } from "@/actions/calendars/update";
import { Calendar as CalendarType } from "@prisma/client";
import { toast } from "sonner";

interface ManageCalendarsClientProps {
  calendars: CalendarType[];
  excessCount: number;
  preSelectedCalendarIds: number[];
  currentLimit: number;
}

export function ManageCalendarsClient({
  calendars,
  excessCount,
  preSelectedCalendarIds,
  currentLimit,
}: ManageCalendarsClientProps) {
  const router = useRouter();
  const [selectedCalendars, setSelectedCalendars] = useState<Set<number>>(new Set(preSelectedCalendarIds));
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error(`Você deve selecionar pelo menos ${excessCount} calendário(s) para desativar.`);
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
            name: calendar?.name || "",
            collaboratorId: calendar.collaboratorId || undefined,
            isActive: false,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success("Calendários desativados com sucesso!");
      router.push("/calendar");
    } catch (error) {
      console.error("Error deactivating calendars:", error);
      toast.error("Erro ao desativar calendários");
    } finally {
      setIsLoading(false);
    }
  };

  const canConfirm = selectedCalendars.size >= excessCount;
  const activeCalendars = calendars.filter((cal) => cal.isActive);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/calendar")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Calendários
        </Button>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 border border-border rounded-full">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Limite de Calendários Excedido</h1>
            <p className="text-muted-foreground">
              Você precisa desativar pelo menos {excessCount} calendário(s) para continuar. Seu limite atual é de{" "}
              {currentLimit} calendários ativos.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Selecione os Calendários para Desativar
          </CardTitle>
          <CardDescription>
            Escolha {excessCount} ou mais calendários para desativar. Os calendários mais antigos já estão selecionados
            por padrão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeCalendars.map((calendar) => (
              <div key={calendar.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{calendar?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Criado em: {new Date(calendar.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`calendar-${calendar.id}`}
                    checked={selectedCalendars.has(calendar.id)}
                    onCheckedChange={() => handleToggleCalendar(calendar.id)}
                  />
                  <Label htmlFor={`calendar-${calendar.id}`}>
                    {selectedCalendars.has(calendar.id) ? "Desativar" : "Manter"}
                  </Label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Selecionados:</strong> {selectedCalendars.size} de {activeCalendars.length} calendários
            </p>
            <p className="text-sm text-muted-foreground mt-1">Mínimo necessário: {excessCount} calendários</p>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => router.push("/calendar")} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!canConfirm || isLoading} className="min-w-[120px]">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando...
                </div>
              ) : (
                "Confirmar Desativação"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
