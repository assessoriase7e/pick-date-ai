"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { CombinedProfileData } from "@/actions/profile/get";
import { useSubscription } from "@/hooks/use-subscription";
import { useCalendarLimits } from "@/hooks/use-calendar-limits";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, AlertTriangle, X } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface SettingsContentProps {
  combinedProfile: CombinedProfileData | null;
}

export function SettingsContent({ combinedProfile }: SettingsContentProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelSubscriptionOpen, setIsCancelSubscriptionOpen] = useState(false);
  const [isCancelCalendarsOpen, setIsCancelCalendarsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { subscription, isSubscriptionActive, cancelSubscription, createPortalSession } = useSubscription();

  const { hasAdditionalCalendars } = useCalendarLimits();

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      setIsCancelSubscriptionOpen(false);
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAdditionalCalendars = async () => {
    // Redireciona para o portal do Stripe para cancelar calendários adicionais
    await createPortalSession();
    setIsCancelCalendarsOpen(false);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Card para Cancelar Assinatura */}
      {isSubscriptionActive && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cancelar Assinatura
            </CardTitle>
            <CardDescription>Cancele sua assinatura principal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscription && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="default">Ativa</Badge>
                </div>
              )}
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Atenção!</p>
                    <p>Ao cancelar, você perderá acesso aos recursos premium no final do período atual.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={() => setIsCancelSubscriptionOpen(true)} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Cancelar Assinatura
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Card para Cancelar Calendários Adicionais */}
      {hasAdditionalCalendars && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendários Adicionais
            </CardTitle>
            <CardDescription>Gerencie seus calendários extras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
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
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelCalendarsOpen(true)}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar Calendários Extras
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Gerencie as configurações da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Nome</p>
              <p className="text-sm text-muted-foreground">
                {combinedProfile?.profile?.companyName || "Não disponível"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{combinedProfile?.email || "Não disponível"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">ID</p>
              <p className="text-sm text-muted-foreground">{combinedProfile?.id}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="w-full">
            Excluir conta
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogos de Confirmação */}
      <DeleteAccountDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />

      <ConfirmationDialog
        open={isCancelSubscriptionOpen}
        onOpenChange={setIsCancelSubscriptionOpen}
        title="Cancelar Assinatura"
        description="Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium no final do período atual."
        confirmText="Sim, cancelar"
        cancelText="Não, manter"
        onConfirm={handleCancelSubscription}
        variant="destructive"
        loading={isLoading}
      />

      <ConfirmationDialog
        open={isCancelCalendarsOpen}
        onOpenChange={setIsCancelCalendarsOpen}
        title="Cancelar Calendários Adicionais"
        description="Você será redirecionado para o portal do Stripe para gerenciar seus calendários adicionais."
        confirmText="Continuar"
        cancelText="Cancelar"
        onConfirm={handleCancelAdditionalCalendars}
        variant="default"
      />
    </div>
  );
}
