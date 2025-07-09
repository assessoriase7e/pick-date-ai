"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/store/subscription-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubscriptionBlockerProps {
  children: ReactNode;
  fallbackText?: string;
  buttonText?: string;
  modalTitle?: string;
  modalDescription?: string;
  modalButtonText?: string;
}

export function SubscriptionBlocker({
  children,
  fallbackText = "Esta ação requer uma assinatura ativa",
  buttonText = "Desbloquear",
  modalTitle = "Assinatura necessária",
  modalDescription = "Para utilizar esta funcionalidade, você precisa ter uma assinatura ativa, ser um usuário vitalício ou estar em período de teste.",
  modalButtonText = "Ver planos",
}: SubscriptionBlockerProps) {
  const router = useRouter();
  const { data } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verifica se o usuário tem acesso às funcionalidades premium
  // Adicionar verificação explícita para usuários lifetime
  const isLifetimeUser = data?.isSubscriptionActive && !data?.subscription;
  const hasAccess = data?.isSubscriptionActive || data?.isTrialActive || isLifetimeUser;

  // Se o usuário tem acesso, renderiza o children normalmente
  if (hasAccess) {
    return <>{children}</>;
  }

  // Função para abrir o modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Função para redirecionar para a página de preços
  const handleViewPricing = () => {
    router.push("/pricing");
    setIsModalOpen(false);
  };

  // Se o usuário não tem acesso, renderiza o botão bloqueado
  return (
    <>
      <div className="relative inline-block">
        <Button onClick={handleOpenModal} variant="destructive">
          {buttonText}
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleViewPricing}>{modalButtonText}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
