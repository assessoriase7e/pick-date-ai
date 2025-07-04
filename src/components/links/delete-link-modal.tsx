"use client";

import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

interface DeleteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  linkTitle: string;
}

export function DeleteLinkModal({
  isOpen,
  onClose,
  onConfirm,
  linkTitle,
}: DeleteLinkModalProps) {
  return (
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      itemName={linkTitle}
      itemType="o link"
    />
  );
}