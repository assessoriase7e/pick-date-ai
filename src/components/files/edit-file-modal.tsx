"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateFile } from "@/actions/files/update";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileRecord } from "@prisma/client";

interface EditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileRecord | null;
}

export function EditFileModal({ isOpen, onClose, file }: EditFileModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileData, setFileData] = useState<FileRecord | null>(null);

  useEffect(() => {
    if (file) {
      setFileData(file);
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileData.id) {
      alert("ID do arquivo não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateFile(fileData.id, {
        description: fileData.description,
      });

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert("Erro ao atualizar arquivo: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar arquivo:", error);
      alert("Ocorreu um erro ao atualizar o arquivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Arquivo</DialogTitle>
          <DialogDescription>
            Atualize as informações do arquivo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">Nome do Arquivo</Label>
              <div className="mt-2 p-2 border rounded-md bg-muted">
                {fileData.fileName}
              </div>
            </div>

            <div>
              <Label htmlFor="fileType">Tipo</Label>
              <div className="mt-2 p-2 border rounded-md bg-muted uppercase">
                {fileData.fileType}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={fileData.description}
                onChange={(e) =>
                  setFileData({ ...fileData, description: e.target.value })
                }
                className="mt-2"
                placeholder="Descreva o arquivo..."
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
