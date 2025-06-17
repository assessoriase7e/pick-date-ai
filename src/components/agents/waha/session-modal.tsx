"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SessionForm } from "./session-form";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  profilePhone?: string;
  companyName?: string;
}

export function SessionModal({ 
  isOpen, 
  onClose, 
  initialData, 
  profilePhone, 
  companyName 
}: SessionModalProps) {
  const title = initialData ? "Editar Sessão" : "Nova Sessão";

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      showFooter={false}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {initialData
            ? "Edite os detalhes da sessão do WhatsApp"
            : "Crie uma nova sessão do WhatsApp"}
        </p>
        
        <SessionForm
          initialData={initialData}
          onSuccess={onClose}
          profilePhone={profilePhone}
          companyName={companyName}
        />
      </div>
    </ConfirmationDialog>
  );
}