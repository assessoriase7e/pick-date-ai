"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Unlink } from "lucide-react";
import { detachComboFromClient } from "@/actions/combos/detach-combo-from-client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DetachComboButtonProps {
  clientComboId: number;
}

export function DetachComboButton({ clientComboId }: DetachComboButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDetachCombo = async () => {
    setIsLoading(true);
    try {
      const result = await detachComboFromClient(clientComboId);
      
      if (result.success) {
        toast.success("Pacote desatrelado com sucesso");
      } else {
        toast.error(result.error || "Erro ao desatrelar pacote");
      }
    } catch (error) {
      console.error("Erro ao desatrelar pacote:", error);
      toast.error("Ocorreu um erro ao desatrelar o pacote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Unlink className="h-4 w-4 mr-2" />
          Desatrelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desatrelar Pacote</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja desatrelar este pacote? Esta ação manterá os créditos já utilizados, 
            mas o pacote não estará mais vinculado ao modelo original. Isso é útil quando você precisa 
            manter o histórico de uso, mas não quer que o pacote seja afetado por alterações no modelo original.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDetachCombo();
            }}
            disabled={isLoading}
          >
            {isLoading ? "Desatrelando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}