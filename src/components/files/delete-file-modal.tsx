"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface DeleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
}

export function DeleteFileModal({
  isOpen,
  onClose,
  onConfirm,
  fileName,
}: DeleteFileModalProps) {
  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Confirmar exclusão"
      description={`Tem certeza que deseja excluir o arquivo ${fileName}? Esta ação não pode ser desfeita.`}
      confirmText="Excluir"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      variant="destructive"
    />
  );
}