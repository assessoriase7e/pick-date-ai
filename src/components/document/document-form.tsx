"use client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fileToBase64, getFileTypeFromName } from "@/lib/utils";
import { toast } from "sonner";
import { DocumentRecord } from "@prisma/client";
import { documentSchema } from "@/validators/document";
import { useUser } from "@clerk/nextjs";

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  initialData?: Pick<
    DocumentRecord,
    "description" | "fileName" | "documentBase64" | "fileType"
  >;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function DocumentForm({
  initialData,
  onSubmit,
  onCancel,
}: DocumentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { user } = useUser();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          documentFile: undefined,
        }
      : {
          description: "",
          documentFile: undefined,
        },
  });

  const handleSubmit: SubmitHandler<DocumentFormValues> = async (data) => {
    try {
      setIsLoading(true);

      if (!data.documentFile && !initialData) {
        toast("Por favor, selecione um arquivo.");
        setIsLoading(false);
        return;
      }

      let documentData = {
        userId: user?.id,
        description: data.description,
        documentBase64: "",
        fileName: "",
        fileType: "",
      };

      if (data.documentFile) {
        const documentBase64 = await fileToBase64(data.documentFile);
        const fileType = getFileTypeFromName(data.documentFile.name);

        documentData = {
          ...documentData,
          documentBase64,
          fileName: data.documentFile.name,
          fileType,
        };
      }

      await onSubmit(documentData);

      form.reset();
      setDocumentPreview(null);
      setFileName(null);
    } catch (error) {
      toast("Ocorreu um erro ao salvar o documento.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf" && file.size > 1 * 1024 * 1024) {
      toast("O arquivo PDF excede o limite de 1MB.");
      e.target.value = "";
      return;
    }

    form.setValue("documentFile", file, { shouldValidate: true });
    setFileName(file.name);

    if (file.type === "application/pdf") {
      const documentUrl = URL.createObjectURL(file);
      setDocumentPreview(documentUrl);

      return () => {
        URL.revokeObjectURL(documentUrl);
      };
    } else {
      setDocumentPreview(null);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="documentFile"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Arquivo de documento (PDF ou DOCX)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleDocumentChange}
                    {...fieldProps}
                  />
                  {fileName && (
                    <div className="text-sm text-muted-foreground">
                      Arquivo selecionado: {fileName}
                    </div>
                  )}
                  {documentPreview && (
                    <div className="mt-2 border rounded p-2">
                      <p className="text-sm mb-2">Prévia do PDF:</p>
                      <iframe
                        src={documentPreview}
                        className="w-full h-[200px]"
                        title="PDF Preview"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite a descrição do documento"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
