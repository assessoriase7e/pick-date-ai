"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText, Plus, Upload } from "lucide-react";
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
import {
  uploadRagFile,
  getRagFiles,
  deleteRagFile,
} from "@/actions/agents/rag-files";
import { saveRagFiles } from "@/actions/agents/save-rag-files";
import { getWebhookUrl } from "@/actions/agents/get-webhook-url";

export function RagFilesSection() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
    loadWebhookUrl();
  }, [user?.id]);

  const loadFiles = async () => {
    if (!user?.id) return;

    try {
      const result = await getRagFiles(user.id);
      if (result.success && result.data?.files) {
        setFiles(result.data.files);
      }
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    }
  };

  const loadWebhookUrl = async () => {
    if (!user?.id) return;

    try {
      const result = await getWebhookUrl(user.id);
      if (result.success) {
        setWebhookUrl(result?.data?.url || "");
      }
    } catch (error) {
      console.error("Erro ao carregar URL do webhook:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Aceitar qualquer tipo de arquivo de texto ou sem tipo definido
      if (
        file.type === "text/plain" ||
        file.type === "" ||
        file.name.endsWith(".txt")
      ) {
        setSelectedFile(file);
      } else {
        toast.error("Apenas arquivos de texto são permitidos");
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) {
      toast.error("Selecione um arquivo para upload");
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await readFileAsText(selectedFile);

      const result = await uploadRagFile({
        userId: user.id,
        name: selectedFile.name,
        content: fileContent,
      });

      if (result.success) {
        toast.success("Arquivo enviado com sucesso");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        loadFiles();
      } else {
        toast.error(result.error || "Erro ao enviar arquivo");
      }
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes("could not be read")
      ) {
        toast.error("Não foi possível ler o arquivo. Por favor, selecione novamente e tente de novo.");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error("Ocorreu um erro ao enviar o arquivo");
      }
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteRagFile(id);
      if (result.success) {
        toast.success("Arquivo excluído com sucesso");
        loadFiles();
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

  const handleSaveAll = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const ragFilesFormatted = files.map((file) => ({
        id: file.id,
        name: file.name,
        content: file.content,
      }));

      const result = await saveRagFiles({
        userId: user.id,
        ragFiles: ragFilesFormatted,
        webhookUrl: webhookUrl,
      });

      if (result.success) {
        toast.success("Arquivos RAG salvos com sucesso");
      } else {
        toast.error(result.error || "Erro ao salvar arquivos RAG");
      }
    } catch (error) {
      console.error("Erro ao salvar arquivos RAG:", error);
      toast.error("Ocorreu um erro ao salvar os arquivos RAG");
    } finally {
      setIsSaving(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      if (file.size === 0) {
        reject(new Error("File is empty"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new Error("File read result is empty"));
        }
      };
      reader.onerror = (event) => {
        if (reader.error?.name === "NotReadableError") {
          reject(new Error("The file could not be read. This may be due to permission issues or the file being moved/deleted after selection."));
        } else {
          reject(new Error(`Error reading file: ${reader.error?.message || "Unknown error"}`));
        }
      };
      reader.onabort = () => {
        reject(new Error("File reading was aborted"));
      };
      try {
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Arquivos RAG</h2>
        <Button
          onClick={handleSaveAll}
          disabled={isSaving || files.length === 0}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Todos"}
        </Button>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileChange}
          />
        </div>
        <Button onClick={handleUpload} disabled={isLoading || !selectedFile}>
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Enviando..." : "Adicionar"}
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="URL do Webhook (opcional)"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Se fornecido, os arquivos RAG serão enviados para esta URL quando
          salvos
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Arquivo</TableHead>
              <TableHead>Data de Upload</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  Nenhum arquivo encontrado
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow
                  key={file.id}
                  className="cursor-pointer"
                  onClick={() => handleViewContent(file)}
                >
                  <TableCell className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {file.name}
                  </TableCell>
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
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
              {selectedContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
