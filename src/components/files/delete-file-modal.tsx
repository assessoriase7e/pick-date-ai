"use client";

import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

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
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      itemName={fileName}
      itemType="arquivo"
    />
  );
}