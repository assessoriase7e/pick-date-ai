"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  professionalName: string;
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  professionalName,
}: DeleteDocumentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    try {
      setIsLoading(true);
      await onConfirm();
      toast("O documento foi excluído com sucesso.");
    } catch (error) {
      toast("Ocorreu um erro ao excluir o documento.");
      console.error(error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir documento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o documento do profissional{" "}
            {professionalName}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}