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
}

export function ServiceModal({
  isOpen,
  onClose,
  initialData,
}: ServiceModalProps) {
  const title = initialData ? "Editar Serviço" : "Criar Serviço";
  const description = initialData
    ? "Edite as informações do serviço existente."
    : "Adicione um novo serviço ao sistema.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ServiceForm initialData={initialData} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}