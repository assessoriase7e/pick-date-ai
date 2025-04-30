"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const title = initialData ? "Editar Colaborador" : "Novo Colaborador";
  const description = initialData
    ? "Edite as informações do colaborador."
    : "Adicione um novo colaborador ao sistema.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CollaboratorForm
          initialData={initialData}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
