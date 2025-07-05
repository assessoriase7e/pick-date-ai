"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface DeleteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  linkTitle: string;
}

export function DeleteLinkModal({ isOpen, onClose, onConfirm, linkTitle }: DeleteLinkModalProps) {
  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Confirmar exclusão"
      description={`Tem certeza que deseja excluir o link ${linkTitle}? Esta ação não pode ser desfeita.`}
      confirmText="Excluir"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      variant="destructive"
    />
  );
}
