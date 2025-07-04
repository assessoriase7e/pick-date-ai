"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Tem certeza?",
  description,
  itemName,
  itemType = "item",
  isLoading = false,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: DeleteConfirmationDialogProps) {
  const defaultDescription = description || (
    itemName
      ? `Esta ação não pode ser desfeita. Isso excluirá permanentemente ${itemType === "o" || itemType === "a" ? itemType : "o"} ${itemType} ${itemName}.`
      : `Esta ação não pode ser desfeita. Isso excluirá permanentemente ${itemType === "o" || itemType === "a" ? itemType : "o"} ${itemType}.`
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {defaultDescription}
            {itemName && (
              <>
                {" "}
                <span className="font-semibold">{itemName}</span>
                .
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Excluindo..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}