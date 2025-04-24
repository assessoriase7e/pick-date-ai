"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRagFileHandlers, RagFile } from "@/handles/agent";

export function RagFilesForm() {
  const [ragFiles, setRagFiles] = useState<RagFile[]>([]);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const { 
    handleAddRagFile, 
    handleRemoveRagFile, 
    handleViewRagFile 
  } = useRagFileHandlers(
    setRagFiles, 
    setNewFileName, 
    setNewFileContent, 
    setSelectedFileContent, 
    setIsFileDialogOpen
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Arquivos RAG</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Nome do arquivo"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
          <Button onClick={() => handleAddRagFile(newFileName, newFileContent)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
        <Textarea
          placeholder="Conteúdo do arquivo"
          className="min-h-[150px]"
          value={newFileContent}
          onChange={(e) => setNewFileContent(e.target.value)}
        />

        {ragFiles.length > 0 && (
          <div className="border rounded-md mt-4">
            <div className="p-4 font-medium border-b">Arquivos</div>
            <div className="divide-y">
              {ragFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div
                    className="flex-1 cursor-pointer hover:underline"
                    onClick={() => handleViewRagFile(file.content)}
                  >
                    {file.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRagFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conteúdo do Arquivo</DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
                {selectedFileContent}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}