"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateFile } from "@/actions/files/update";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FileRecord } from "@prisma/client";
import { fileSchema, FileFormValues } from "@/validators/file";
import { toast } from "sonner";

interface EditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileRecord | null;
}

export function EditFileModal({ isOpen, onClose, file }: EditFileModalProps) {
  const router = useRouter();

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      fileName: "",
      description: "",
      fileUrl: "",
      fileType: "",
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    if (file) {
      reset(file);
    }
  }, [file, reset]);

  const onSubmit = async (data: FileFormValues) => {
    if (!file || !file.id) {
      alert("ID do arquivo não encontrado");
      return;
    }

    try {
      const result = await updateFile(file.id, {
        description: data.description,
      });

      if (result.success) {
        toast.success("Arquivo atualizado com sucesso!");
        onClose();
        router.refresh();
      } else {
        toast.error("Erro ao atualizar arquivo: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar arquivo:", error);
      toast.error("Ocorreu um erro ao atualizar o arquivo");
    }
  };

  const handleClose = () => {
    reset();
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
      customFooter={customFooter}
      showFooter={true}
    >
      <p className="text-sm text-muted-foreground mb-6">
        Atualize as informações do arquivo.
      </p>

      <form id="edit-file-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fileName">Nome do Arquivo</Label>
            <div className="mt-2 p-2 border rounded-md bg-muted">
              {file?.fileName}
            </div>
          </div>

          <div>
            <Label htmlFor="fileType">Tipo</Label>
            <div className="mt-2 p-2 border rounded-md bg-muted uppercase">
              {file?.fileType}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="mt-2"
              placeholder="Descreva o arquivo..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
        </div>
      </form>
    </ConfirmationDialog>
  );
}
