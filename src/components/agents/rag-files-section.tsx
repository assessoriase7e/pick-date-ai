"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText, Plus } from "lucide-react";
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
  deleteRagFile 
} from "@/actions/agents/rag-files";

export function RagFilesSection() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) {
      toast.error("Selecione um arquivo para upload");
      return;
    }

    if (selectedFile.type !== "text/plain") {
      toast.error("Apenas arquivos TXT são permitidos");
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await readFileAsText(selectedFile);
      
      const result = await uploadRagFile({
        userId: user.id,
        fileName: selectedFile.name,
        content: fileContent
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
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Ocorreu um erro ao enviar o arquivo");
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
    setSelectedFileName(file.fileName);
    setIsDialogOpen(true);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Falha ao ler o arquivo"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo"));
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Arquivos RAG</h2>
      
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileChange}
          />
        </div>
        <Button 
          onClick={handleUpload} 
          disabled={isLoading || !selectedFile}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Enviando..." : "Adicionar"}
        </Button>
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
                    {file.fileName}
                  </TableCell>
                  <TableCell>
                    {new Date(file.createdAt).toLocaleDateString('pt-BR')}
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
            <DialogDescription>
              Conteúdo do arquivo
            </DialogDescription>
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