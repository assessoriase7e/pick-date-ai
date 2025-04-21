import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Adicionado
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKey } from "@prisma/client";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { description?: string }) => Promise<void>;
  initialData?: ApiKey | null;
  title: string;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: ApiKeyModalProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || "");
    } else {
      setDescription(""); // Reset para criação
    }
  }, [initialData, isOpen]); // Resetar quando abrir ou mudar initialData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ description: description || undefined }); // Envia undefined se vazio
      // onClose(); // O fechamento é tratado no componente pai após sucesso
    } catch (error) {
      console.error("Erro no submit do modal:", error);
      // Poderia adicionar um toast de erro aqui também
    } finally {
      setIsSubmitting(false);
    }
  }

  // Resetar estado ao fechar
  function handleClose() {
    setDescription("");
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* Adiciona descrição se for criação */}
          {!initialData && (
             <DialogDescription>
                Insira uma descrição opcional para identificar sua chave de API.
             </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Chave para integração X"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : (initialData ? "Salvar Alterações" : "Gerar Chave")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}