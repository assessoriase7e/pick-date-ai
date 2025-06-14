"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFile } from "@/actions/files/create";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadthingUploader } from "@/components/uploadthing-uploader";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFileModal({ isOpen, onClose }: CreateFileModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileData, setFileData] = useState<{
    fileName: string;
    fileType: string;
    fileUrl: string;
    description: string;
  }>({
    fileName: "",
    fileType: "",
    fileUrl: "",
    description: "",
  });

  const handleUploadComplete = (data: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) => {
    setFileData({
      ...fileData,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileType: data.fileType,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileData.fileUrl || !fileData.fileName) {
      alert("Por favor, selecione um arquivo");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createFile(fileData);

      if (result.success) {
        resetForm();
        onClose();
        router.refresh();
      } else {
        alert("Erro ao criar arquivo: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao criar arquivo:", error);
      alert("Ocorreu um erro ao criar o arquivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFileData({
      fileName: "",
      fileType: "",
      fileUrl: "",
      description: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
      <Button 
        type="submit" 
        disabled={isSubmitting || !fileData.fileUrl}
        form="create-file-form"
      >
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={handleClose}
      title="Adicionar Novo Arquivo"
      size="lg"
      showFooter={false}
      customFooter={customFooter}
    >
      <p className="text-sm text-muted-foreground mb-6">
        Faça upload de um arquivo e adicione uma descrição.
      </p>
      
      <form id="create-file-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo</Label>
            <div className="mt-2">
              {!fileData.fileUrl ? (
                <div className="border rounded-md p-4">
                  <UploadthingUploader
                    onUploadComplete={handleUploadComplete}
                    onUploadError={(error) => {
                      console.error("Erro no upload:", error);
                    }}
                  />
                </div>
              ) : (
                <div className="border rounded-md p-4 flex justify-between items-center">
                  <span>{fileData.fileName}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFileData({
                        ...fileData,
                        fileUrl: "",
                        fileName: "",
                        fileType: "",
                      });
                    }}
                  >
                    Remover
                  </Button>
                </div>
              )}
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