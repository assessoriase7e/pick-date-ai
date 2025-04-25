"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveRagFiles } from "@/actions/agents/rag/save-rag-files";
import { User } from "@clerk/nextjs/server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { deleteRagFile } from "@/actions/agents/rag/delete-rag-file";
import { RagConfig, RagFile } from "@prisma/client";
import { saveRagWebhook } from "@/actions/agents/rag/save-rag-webhook";
import { callRagWebhook } from "@/actions/agents/rag/call-rag-webhook";

type RagFilesSectionPropos = {
  user: User;
  ragFiles: RagFile[];
  ragConfig?: RagConfig;
};

const ragFilesSchema = z.object({
  webhookUrl: z.string().url({ message: "URL inválida" }).optional(),
  metadataKey: z.string().optional(),
});

type RagFilesFormValues = z.infer<typeof ragFilesSchema>;

export function RagFilesSection({
  user,
  ragFiles,
  ragConfig,
}: RagFilesSectionPropos) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RagFilesFormValues>({
    resolver: zodResolver(ragFilesSchema),
    defaultValues: {
      webhookUrl: ragConfig?.webhookUrl || "",
      metadataKey: ragConfig?.metadataKey || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Aceitar arquivos de texto e docx
      if (
        file.type === "text/plain" ||
        file.type === "" ||
        file.name.endsWith(".txt") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
      } else {
        toast.error(
          "Apenas arquivos de texto (.txt) ou Word (.docx) são permitidos"
        );
        e.target.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteRagFile(id);
      if (result.success) {
        toast.success("Arquivo excluído com sucesso");
      } else {
        toast.error(result.error || "Erro ao excluir arquivo");
      }
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast.error("Ocorreu um erro ao excluir o arquivo");
    }
  };

  const handleViewContent = (file: any) => {
    setSelectedContent(file.content);
    setSelectedFileName(file.name);
    setIsDialogOpen(true);
  };

  const handleSaveAll = async (data: RagFilesFormValues) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await saveRagFiles({
        userId: user.id,
        ragFiles: ragFiles,
      });

      if (data.webhookUrl && data.metadataKey) {
        await saveRagWebhook({
          userId: user.id,
          webhookUrl: data.webhookUrl,
          metadataKey: data.metadataKey,
        });

        await callRagWebhook({
          ragFiles: ragFiles,
          webhookUrl: data.webhookUrl,
          metadataKey: data.metadataKey,
        });
      }

      toast.success("Arquivos RAG salvos com sucesso");
    } catch (error) {
      console.error("Erro ao salvar arquivos RAG:", error);
      toast.error("Ocorreu um erro ao salvar os arquivos RAG");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Arquivos RAG</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveAll)} className="space-y-2">
          <div className="flex items-end gap-4">
            <div className="flex gap-5 flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
              />

              <Button
                type="submit"
                disabled={isSaving || ragFiles?.length === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar Todos"}
              </Button>
            </div>
          </div>

          <div className="flex gap-5">
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem className="w-full mb-1">
                  <FormLabel>URL do Webhook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadataKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Metadata</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nome_negocio"
                      className="w-56"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Se fornecido, os arquivos RAG serão enviados para esta URL quando
            salvos
          </p>
        </form>
      </Form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Arquivo</TableHead>
              <TableHead>Chave metadata</TableHead> {/* Novo cabeçalho */}
              <TableHead>Data de Upload</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ragFiles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Nenhum arquivo encontrado
                </TableCell>
              </TableRow>
            ) : (
              ragFiles?.map((file) => (
                <TableRow
                  key={file.id}
                  className="cursor-pointer"
                  onClick={() => handleViewContent(file)}
                >
                  <TableCell className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {file.name}
                  </TableCell>
                  <TableCell>{ragConfig?.metadataKey || "-"}</TableCell>
                  <TableCell>
                    {new Date(file.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFileName}</DialogTitle>
            <DialogDescription>Conteúdo do arquivo</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-line bg-muted p-4 rounded-md text-sm">
              {selectedContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
