import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteQuestionTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  textTitle: string;
}

export function DeleteQuestionTextModal({ isOpen, onClose, onConfirm, textTitle }: DeleteQuestionTextModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationDialog open={isOpen} onOpenChange={onClose} title="Excluir Texto" showFooter={false}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o texto <strong>"{textTitle}"</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </div>
      </div>
    </ConfirmationDialog>
  );
}