"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateFileDialog } from "@/components/files/create-file-dialog";
import { FilesDataTable } from "@/components/files/files-data-table";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { FileRecord } from "@prisma/client";
import { EditFileModal } from "./edit-file-modal";
import { DeleteFileModal } from "./delete-file-modal";
import { deleteFile } from "@/actions/files/delete";
import { toast } from "sonner";
import { createFileColumns } from "@/table-columns/files";

interface FilesContentProps {
  data: FileRecord[];
  totalPages: number;
  currentPage: number;
}

export function FilesContent({ data, totalPages, currentPage }: FilesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const router = useRouter();

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    router.refresh();
  };

  const openEditModal = (file: FileRecord) => {
    setSelectedFile(file);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedFile(null);
    setIsEditModalOpen(false);
    router.refresh();
  };

  const openDeleteModal = (file: FileRecord) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedFile(null);
    setIsDeleteModalOpen(false);
    router.refresh();
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      await deleteFile(selectedFile.id);
      toast.success("Arquivo excluído com sucesso!");
      closeDeleteModal();
    } catch (error) {
      toast.error("Erro ao excluir o arquivo.");
    }
  };

  const columns = createFileColumns({
    onEdit: openEditModal,
    onDelete: openDeleteModal,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Arquivos</h1>
          <p className="text-muted-foreground">Gerencie os arquivos que serão enviados</p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Arquivo
        </Button>
      </div>

      <CreateFileDialog isOpen={isDialogOpen} onClose={closeDialog} />
      {selectedFile && <EditFileModal isOpen={isEditModalOpen} onClose={closeEditModal} file={selectedFile} />}
      {selectedFile && (
        <DeleteFileModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteFile}
          fileName={selectedFile.fileName}
        />
      )}

      <Suspense fallback={<div>Carregando arquivos...</div>}>
        <FilesDataTable data={data} columns={columns} totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
