"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
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
import { getRagFiles, deleteRagFile } from "@/actions/agents/rag-files";
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
  const [metadataKey, setMetadataKey] = useState<string>("");

  useEffect(() => {
    loadFiles();
    loadWebhookUrl();
  }, [user?.id]);

  const loadWebhookUrl = async () => {
    if (!user?.id) return;

    try {
      const result = await getWebhookUrl(user.id);
      console.log("result", result);
      if (result.success) {
        setWebhookUrl(result?.data?.url || "");
      }
    } catch (error) {
      console.error("Erro ao carregar URL do webhook:", error);
    }
  };

  const loadFiles = async () => {
    if (!user?.id) return;

    try {
      const result = await getRagFiles(user.id);
      if (result.success && result.data?.files) {
        setFiles(result.data.files);
        if (result.data.files.length > 0) {
          const sortedFiles = [...result.data.files].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setMetadataKey(sortedFiles[0].metadataKey || "");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    }
  };

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
        setSelectedFile(file);
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
        metadataKey: file.metadataKey, // <-- Adicionado para garantir que o campo seja enviado
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
          reject(
            new Error(
              "The file could not be read. This may be due to permission issues or the file being moved/deleted after selection."
            )
          );
        } else {
          reject(
            new Error(
              `Error reading file: ${reader.error?.message || "Unknown error"}`
            )
          );
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
      </div>

      <div className="flex items-end gap-4">
        <div className="flex  gap-5 flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileChange}
          />

          <Button
            onClick={handleSaveAll}
            disabled={isSaving || files.length === 0}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Todos"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-5">
          <Input
            placeholder="URL do Webhook (opcional)"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />

          <Input
            placeholder="Chave metadata"
            value={metadataKey}
            onChange={(e) => setMetadataKey(e.target.value)}
            className="w-56"
          />
        </div>
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
              <TableHead>Chave metadata</TableHead> {/* Novo cabeçalho */}
              <TableHead>Data de Upload</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
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
                  <TableCell>{file.metadataKey || "-"}</TableCell>
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
