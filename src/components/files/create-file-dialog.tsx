"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFile } from "@/actions/files/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { UploadthingUploader } from "@/components/uploadthing-uploader";
import { fileSchema, FileFormValues } from "@/validators/file";
import { X } from "lucide-react";

import { toast } from "sonner";

interface CreateFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFileDialog({ isOpen, onClose }: CreateFileDialogProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      fileName: "",
      description: "",
      fileUrl: "",
      fileType: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const fileUrl = watch("fileUrl");
  const fileType = watch("fileType");

  const handleUploadBegin = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (res: any) => {
    setValue("fileName", res.fileName);
    setValue("fileUrl", res.fileUrl);
    setValue("fileType", res.fileType);
    setIsUploading(false);
  };

  const handleRemoveFile = () => {
    setValue("fileUrl", "");
    setValue("fileType", "");
  };

  const onSubmit = async (data: FileFormValues) => {
    try {
      const result = await createFile(data);

      if (result.success) {
        toast.success("Arquivo criado com sucesso!");
        form.reset();
        onClose();
        router.refresh();
      } else {
        toast.error("Erro ao criar arquivo: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao criar arquivo:", error);
      toast.error("Ocorreu um erro ao criar o arquivo");
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const customFooter = (
    <>
      <Button
        type="submit"
        disabled={isSubmitting || isUploading || !fileUrl}
        form="create-file-form"
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
      <form
        id="create-file-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo</Label>
            <div className="mt-2">
              <div className="border rounded-md p-4">
                {fileUrl ? (
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden">
                      {fileType.startsWith("image/") ? (
                        <img
                          src={fileUrl}
                          alt={watch("fileName")}
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
              {errors.fileUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fileUrl.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="fileName">Nome do Arquivo</Label>
            <Input
              id="fileName"
              {...register("fileName")}
              className="mt-2"
              placeholder="Digite o nome do arquivo..."
              disabled={isUploading}
            />
            {errors.fileName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fileName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="mt-2"
              placeholder="Descreva o arquivo..."
              disabled={isUploading}
            />
          </div>
        </div>
      </form>
    </ConfirmationDialog>
  );
}
