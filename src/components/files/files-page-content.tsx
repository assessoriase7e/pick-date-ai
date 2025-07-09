"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { FileRecord, Client } from "@prisma/client";
import { FilesDataTable } from "@/components/files/files-data-table";
import { createFileColumns } from "@/table-columns/files";
import { CreateFileDialog } from "@/components/files/create-file-dialog";
import { EditFileModal } from "@/components/files/edit-file-modal";
import { DeleteFileModal } from "@/components/files/delete-file-modal";
import { SendFileToClientsModal } from "@/components/files/send-file-to-clients-modal";
import { deleteFile } from "@/actions/files/delete";
import { searchClients } from "@/actions/clients/search-clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FilesPageContentProps {
  files: FileRecord[];
  totalPages: number;
  currentPage: number;
  initialClients: Client[];
}

export function FilesPageContent({ files, totalPages, currentPage, initialClients }: FilesPageContentProps) {
  const router = useRouter();

  // Estados mínimos necessários para modais
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileRecord | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileRecord | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<(string | number)[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileRecord[]>([]);

  const handleEdit = (file: FileRecord) => {
    setEditingFile(file);
  };

  const handleDelete = (file: FileRecord) => {
    setDeletingFile(file);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    try {
      const result = await deleteFile(deletingFile.id);
      if (result.success) {
        toast.success("Arquivo excluído com sucesso!");
        setDeletingFile(null);
        router.refresh();
      } else {
        toast.error("Erro ao excluir arquivo");
      }
    } catch (error) {
      toast.error("Erro ao excluir arquivo");
    }
  };

  const handleSelectionChange = (ids: (string | number)[]) => {
    setSelectedFileIds(ids);
    const filesFiltered = files.filter((file) => ids.includes(file.id));
    setSelectedFiles(filesFiltered);
  };

  const handleSendFiles = () => {
    if (selectedFileIds.length === 0) {
      toast.error("Selecione pelo menos um arquivo para enviar");
      return;
    }
    setIsSendModalOpen(true);
  };

  const columns = createFileColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="lg:space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col lg:!flex-row items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Arquivos</h1>
          <p className="text-muted-foreground">Gerencie os arquivos que serão enviados</p>
        </div>
        <div className="flex space-x-2 mb-2 w-full lg:w-min">
          {selectedFileIds.length > 0 && (
            <Button onClick={handleSendFiles} variant="outline" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Enviar Selecionados ({selectedFileIds.length})
            </Button>
          )}
          {/* Removemos o botão de criação daqui */}
        </div>
      </div>

      <FilesDataTable
        data={files}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        onSelectionChange={handleSelectionChange}
        onCreateClick={() => setIsCreateDialogOpen(true)} // Passando o evento de clique
      />

      {/* Modais permanecem fora da tabela */}
      <CreateFileDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          router.refresh();
        }}
      />

      {editingFile && (
        <EditFileModal
          isOpen={!!editingFile}
          onClose={() => {
            setEditingFile(null);
            router.refresh();
          }}
          file={editingFile}
        />
      )}

      {deletingFile && (
        <DeleteFileModal
          isOpen={!!deletingFile}
          onClose={() => setDeletingFile(null)}
          onConfirm={handleConfirmDelete}
          fileName={deletingFile.fileName}
        />
      )}

      <SendFileToClientsModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        files={selectedFiles}
        initialClients={initialClients}
        totalPages={1}
        onSearch={searchClients}
      />
    </div>
  );
}
