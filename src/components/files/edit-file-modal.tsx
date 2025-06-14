"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateFile } from "@/actions/files/update";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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

    if (!fileData || !fileData.id) {
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

  // Se não houver dados do arquivo, não renderize o conteúdo do formulário
  if (!fileData) {
    return (
      <ConfirmationDialog
        open={isOpen}
        onOpenChange={handleClose}
        title="Editar Arquivo"
        size="lg"
        showFooter={false}
      >
        <p className="text-sm text-muted-foreground">
          Carregando informações do arquivo...
        </p>
      </ConfirmationDialog>
    );
  }

  const customFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting} form="edit-file-form">
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={handleClose}
      title="Editar Arquivo"
      size="lg"
      showFooter={false}
      customFooter={customFooter}
    >
      <p className="text-sm text-muted-foreground mb-6">
        Atualize as informações do arquivo.
      </p>

      <form id="edit-file-form" onSubmit={handleSubmit} className="space-y-6">
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
      </form>
    </ConfirmationDialog>
  );
}
