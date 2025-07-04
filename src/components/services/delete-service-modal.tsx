"use client";

import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

interface DeleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string;
  isLoading: boolean;
}

export function DeleteServiceModal({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isLoading,
}: DeleteServiceModalProps) {
  return (
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      itemName={serviceName}
      itemType="o serviço"
      isLoading={isLoading}
    />
  );
}