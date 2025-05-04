"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ServiceForm
          initialData={initialData}
          onSuccess={onClose}
          collaborators={collaborators}
        />
      </DialogContent>
    </Dialog>
  );
}
