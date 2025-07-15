"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Plus, Settings, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { AdditionalCalendarInfo } from "@/types/subscription";
import { createPortalSession, createSubscription } from "@/store/subscription-store";
import { useRouter } from "next/navigation";

interface AdditionalCalendarManagementProps {
  additionalCalendars: AdditionalCalendarInfo[];
}

export function AdditionalCalendarManagement({ additionalCalendars }: AdditionalCalendarManagementProps) {
  const router = useRouter();
  const [calendars, setCalendars] = useState<AdditionalCalendarInfo[]>(additionalCalendars);
  const [isLoading, setIsLoading] = useState(false);

  const hasActiveCalendars = calendars.some((calendar) => calendar.active);

  const handleManageCalendars = async () => {
    setIsLoading(true);
    try {
      await createPortalSession();
      toast.success("Redirecionando para o portal de gerenciamento");
    } catch (error) {
      console.error("Error managing calendars:", error);
      toast.error("Erro ao acessar portal de gerenciamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCalendar = async () => {
    setIsLoading(true);
    try {
      // Redirecionar diretamente para o checkout do Stripe
      await createSubscription(process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_CALENDAR!);
      toast.success("Redirecionando para o checkout");
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Erro ao criar assinatura");
    } finally {
      setIsLoading(false);
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
            <p className="text-sm text-muted-foreground mb-4">Você não possui calendários adicionais ativos.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Compra</TableHead>
                  <TableHead>Expira em</TableHead>
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
                      {calendar.purchaseDate 
                        ? format(new Date(calendar.purchaseDate), "dd/MM/yyyy", { locale: ptBR })
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {calendar.expiresAt
                        ? format(new Date(calendar.expiresAt), "dd/MM/yyyy", { locale: ptBR })
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {hasActiveCalendars && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Gerenciamento via Stripe</p>
                    <p>
                      Use o portal do Stripe para cancelar, alterar ou ver detalhes dos seus calendários adicionais.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="space-y-2">
        {hasActiveCalendars ? (
          <>
            {/* Botão principal para gerenciar via Stripe */}
            <Button onClick={handleManageCalendars} className="w-full" disabled={isLoading}>
              <Settings className="h-4 w-4 mr-2" />
              {isLoading ? "Carregando..." : "Gerenciar via Stripe"}
            </Button>

            {/* Botão secundário para adicionar mais calendários */}
            <Button onClick={handleAddCalendar} variant="outline" className="w-full" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mais Calendários
            </Button>
          </>
        ) : (
          <Button onClick={handleAddCalendar} className="w-full" variant="default" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Calendário
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
