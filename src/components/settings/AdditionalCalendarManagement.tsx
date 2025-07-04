"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { listAdditionalCalendars, AdditionalCalendarData } from "@/actions/subscription/list-additional-calendars";
import { cancelAdditionalCalendar } from "@/actions/subscription/cancel-additional-calendar";
import { createCalendarCheckout } from "@/actions/subscription/create-calendar-checkout";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export function AdditionalCalendarManagement() {
  const [calendars, setCalendars] = useState<AdditionalCalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [calendarToCancel, setCalendarToCancel] = useState<number | null>(null);

  const loadCalendars = async () => {
    try {
      setIsLoading(true);
      const data = await listAdditionalCalendars();
      setCalendars(data);
    } catch (error) {
      console.error("Error loading calendars:", error);
      toast.error("Erro ao carregar calendários adicionais");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendars();
  }, []);

  const handleCancelCalendar = async (calendarId: number) => {
    try {
      setCancelingId(calendarId);
      await cancelAdditionalCalendar(calendarId);
      toast.success("Calendário adicional cancelado com sucesso");
      await loadCalendars();
    } catch (error) {
      console.error("Error cancelling calendar:", error);
      toast.error("Erro ao cancelar calendário adicional");
    } finally {
      setCancelingId(null);
      setCalendarToCancel(null);
    }
  };

  const handleAddCalendar = async () => {
    try {
      await createCalendarCheckout();
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao criar checkout");
    }
  };

  const activeCalendars = calendars.filter((cal) => cal.active);
  const hasActiveCalendars = activeCalendars.length > 0;

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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendários Adicionais
          </CardTitle>
          <CardDescription>
            Gerencie seus calendários extras. Cada calendário adicional custa R$ 19,90/mês.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasActiveCalendars ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Compra</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCalendars.map((calendar) => (
                      <TableRow key={calendar.id}>
                        <TableCell>
                          <Badge variant={calendar.active ? "default" : "secondary"}>
                            {calendar.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(calendar.purchaseDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>
                          {calendar.cancelAtPeriodEnd ? (
                            <Badge variant="destructive">Cancelamento Agendado</Badge>
                          ) : (
                            <Badge variant="default">Ativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!calendar.cancelAtPeriodEnd && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setCalendarToCancel(calendar.id)}
                              disabled={cancelingId === calendar.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {cancelingId === calendar.id ? "Cancelando..." : "Cancelar"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Importante:</p>
                  <p>
                    Ao cancelar um calendário adicional, se você tiver mais calendários ativos do que o permitido,
                    alguns serão automaticamente desativados.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum calendário adicional</h3>
              <p className="text-muted-foreground mb-4">Você não possui calendários adicionais ativos.</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {activeCalendars.length} calendário(s) adicional(is) ativo(s)
            </div>
            <Button onClick={handleAddCalendar}>Adicionar Calendário</Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={!!calendarToCancel}
        onClose={() => setCalendarToCancel(null)}
        onConfirm={() => calendarToCancel && handleCancelCalendar(calendarToCancel)}
        title="Cancelar Calendário Adicional"
        description="Tem certeza que deseja cancelar este calendário adicional? Esta ação não pode ser desfeita. Atenção: Se você tiver mais calendários ativos do que o permitido após o cancelamento, alguns calendários serão automaticamente desativados."
        confirmText="Confirmar Cancelamento"
        itemType="calendário adicional"
      />
    </>
  );
}
