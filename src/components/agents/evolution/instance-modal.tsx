"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InstanceForm } from "./instance-form";

interface InstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  profilePhone?: string;
}

export function InstanceModal({
  isOpen,
  onClose,
  initialData,
  profilePhone,
}: InstanceModalProps) {
  const title = initialData ? "Editar Instância" : "Nova Instância";
  const description = initialData
    ? "Edite os detalhes da instância do WhatsApp"
    : "Crie uma nova instância do WhatsApp";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <InstanceForm
          initialData={initialData}
          onSuccess={onClose}
          profilePhone={profilePhone}
        />
      </DialogContent>
    </Dialog>
  );
}
