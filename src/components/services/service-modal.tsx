"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ServiceForm } from "./service-form";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  collaborators: any[];
}

export function ServiceModal({
  isOpen,
  onClose,
  initialData,
  collaborators,
}: ServiceModalProps) {
  const title = initialData ? "Editar Serviço" : "Novo Serviço";
  const description = initialData
    ? "Edite as informações do serviço."
    : "Adicione um novo serviço ao sistema.";

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      size="lg"
      showFooter={false}
    >
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <div className="max-h-[60vh] overflow-y-auto">
        <ServiceForm
          initialData={initialData}
          onSuccess={onClose}
          collaborators={collaborators}
        />
      </div>
    </ConfirmationDialog>
  );
}
