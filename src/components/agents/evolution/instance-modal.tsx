"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { InstanceForm } from "./instance-form";

interface InstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  profilePhone?: string;
  companyName?: string;
}

export function InstanceModal({ 
  isOpen, 
  onClose, 
  initialData, 
  profilePhone, 
  companyName 
}: InstanceModalProps) {
  const title = initialData ? "Editar Instância" : "Nova Instância";

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
            ? "Edite os detalhes da instância do WhatsApp"
            : "Crie uma nova instância do WhatsApp"}
        </p>
        
        <InstanceForm
          initialData={initialData}
          onSuccess={onClose}
          profilePhone={profilePhone}
          companyName={companyName}
        />
      </div>
    </ConfirmationDialog>
  );
}
