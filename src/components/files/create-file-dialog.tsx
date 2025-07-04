"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFile } from "@/actions/files/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { UploadthingUploader } from "@/components/uploadthing-uploader";
import { X } from "lucide-react";

interface CreateFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFileDialog({ isOpen, onClose }: CreateFileDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileData, setFileData] = useState({
    fileName: "",
    description: "",
    fileUrl: "",
    fileType: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleUploadBegin = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (res: any) => {
    setFileData({ ...fileData, ...res });
    setIsUploading(false);
  };

  const handleRemoveFile = () => {
    setFileData({
      ...fileData,
      fileUrl: "",
      fileType: "",
    });
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setFileData({
      fileName: "",
      description: "",
      fileUrl: "",
      fileType: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileData.fileUrl) {
      alert("Por favor, faça o upload de um arquivo");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createFile({
        fileName: fileData.fileName,
        description: fileData.description || "",
        fileUrl: fileData.fileUrl,
        fileType: fileData.fileType,
      });

      if (result.success) {
        resetForm(); // Resetar o formulário
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

  // Resetar formulário ao fechar o modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const customFooter = (
    <>
      <Button
        type="submit"
        disabled={isSubmitting || !fileData.fileUrl}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Criando..." : "Criar"}
      </Button>
    </>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={handleClose}
      title="Novo Arquivo"
      description="Faça o upload de um arquivo para o sistema."
      size="lg"
      showFooter={true}
      customFooter={customFooter}
    >
      <div className="space-y-6 flex items-center justify-center h-full">
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo</Label>
            <div className="mt-2">
              <div className="border rounded-md p-4">
                {fileData.fileUrl ? (
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden">
                      {fileData.fileType.startsWith("image/") ? (
                        <img
                          src={fileData.fileUrl}
                          alt={fileData.fileName}
                          className="w-full h-auto max-h-[200px] object-contain rounded-lg"
                        />
                      ) : (
                        <div className=" p-4 rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Arquivo carregado
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 text-muted-foreground rounded-full p-1 shadow-md"
                      aria-label="Remover arquivo"
                    >
                      <X className="h-8 w-8" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadthingUploader
                      onUploadBegin={handleUploadBegin}
                      onUploadComplete={handleUploadComplete}
                      endpoint="fileUploader"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="fileName">Nome do Arquivo</Label>
            <Input
              id="fileName"
              value={fileData.fileName}
              onChange={(e) =>
                setFileData({ ...fileData, fileName: e.target.value })
              }
              className="mt-2"
              placeholder="Digite o nome do arquivo..."
              required
              disabled={isUploading}
            />
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
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
