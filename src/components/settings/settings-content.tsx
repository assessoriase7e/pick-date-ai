"use client";
import { useState } from "react";
import { SubscriptionSettings } from "./SubscriptionSettings";
import { AdditionalAISettings } from "./AdditionalAISettings";
import { AdditionalCalendarSettings } from "./AdditionalCalendarSettings";
import { AccountDeletionCard } from "./AccountDeletionCard";
import { CombinedProfileData } from "@/actions/profile/get";
import { useSubscription } from "@/hooks/use-subscription";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface SettingsContentProps {
  combinedProfile: CombinedProfileData | null;
}

export function SettingsContent({ combinedProfile }: SettingsContentProps) {
  const [isCancelSubscriptionOpen, setIsCancelSubscriptionOpen] = useState(false);
  const [isCancelCalendarsOpen, setIsCancelCalendarsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { cancelSubscription, createPortalSession } = useSubscription();

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
    await createPortalSession();
    setIsCancelCalendarsOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Seção de Assinatura Principal */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Assinatura Principal</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <SubscriptionSettings />
        </div>
      </div>

      {/* Seção de Pacotes Adicionais de IA */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pacotes Adicionais de IA</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <AdditionalAISettings />
        </div>
      </div>

      {/* Seção de Calendários Adicionais */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Calendários Adicionais</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <AdditionalCalendarSettings />
        </div>
      </div>

      {/* Seção de Exclusão de Conta */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Gerenciamento de Conta</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <AccountDeletionCard combinedProfile={combinedProfile} />
        </div>
      </div>

      {/* Diálogos de Confirmação */}
      <ConfirmationDialog
        open={isCancelSubscriptionOpen}
        onOpenChange={setIsCancelSubscriptionOpen}
        title="Cancelar Assinatura"
        description="Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium no final do período atual."
        confirmText="Sim, cancelar"
        cancelText="Não, manter"
        onConfirm={handleCancelSubscription}
        variant="destructive"
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
