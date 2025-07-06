"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { AdditionalCalendarInfo } from "@/types/subscription";
import { createPortalSession } from "@/store/subscription-store";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface AdditionalCalendarManagementProps {
  additionalCalendars: AdditionalCalendarInfo[];
}

export function AdditionalCalendarManagement({ additionalCalendars }: AdditionalCalendarManagementProps) {
  const [calendars, setCalendars] = useState<AdditionalCalendarInfo[]>(additionalCalendars);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [calendarToCancel, setCalendarToCancel] = useState<string | null>(null);

  const handleCancelCalendar = async (calendarId: string) => {
    try {
      setCancelingId(calendarId);
      // Redirect to Stripe portal for calendar management
      await createPortalSession();
      toast.success("Redirecionando para o portal de gerenciamento");
    } catch (error) {
      console.error("Error managing calendar:", error);
      toast.error("Erro ao acessar portal de gerenciamento");
    } finally {
      setCancelingId(null);
      setCalendarToCancel(null);
    }
  };

  const handleAddCalendar = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast.error("Erro ao acessar portal");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendários Adicionais
        </CardTitle>
        <CardDescription>Gerencie seus calendários adicionais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {calendars.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Você não possui calendários adicionais ativos.
            </p>
            <Button onClick={handleAddCalendar} variant="outline">
              Adicionar Calendário
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendars.map((calendar) => (
                  <TableRow key={calendar.id}>
                    <TableCell className="font-medium">#{calendar.id}</TableCell>
                    <TableCell>
                      <Badge variant={calendar.active ? "default" : "secondary"}>
                        {calendar.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(calendar.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      {calendar.active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCalendarToCancel(calendar.id)}
                          disabled={cancelingId === calendar.id}
                        >
                          {cancelingId === calendar.id ? (
                            "Processando..."
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Gerenciar
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end">
              <Button onClick={handleAddCalendar} variant="outline">
                Adicionar Calendário
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <ConfirmationDialog
        open={!!calendarToCancel}
        onOpenChange={(open) => !open && setCalendarToCancel(null)}
        title="Gerenciar Calendário"
        description="Você será redirecionado para o portal do Stripe para gerenciar este calendário adicional."
        confirmText="Continuar"
        cancelText="Cancelar"
        onConfirm={() => calendarToCancel && handleCancelCalendar(calendarToCancel)}
        variant="default"
      />
    </Card>
  );
}
