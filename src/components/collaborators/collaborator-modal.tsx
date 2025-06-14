"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CollaboratorForm } from "./collaborator-form";

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function CollaboratorModal({
  isOpen,
  onClose,
  initialData,
}: CollaboratorModalProps) {
  const title = initialData ? "Editar Profissional" : "Novo Profissional";
  const description = initialData
    ? "Edite as informações do profissional."
    : "Adicione um novo profissional ao sistema.";

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      description={description}
      confirmText=""
      cancelText=""
      showFooter={false}
      size="lg"
    >
      <CollaboratorForm initialData={initialData} onSuccess={onClose} />
    </ConfirmationDialog>
  );
}
