"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CreateFileDialog } from "@/components/files/create-file-dialog";
import { FilesDataTable } from "@/components/files/files-data-table";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { FileRecord } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown } from "lucide-react";
import { EditFileModal } from "./edit-file-modal";
import { DeleteFileModal } from "./delete-file-modal";
import { deleteFile } from "@/actions/files/delete";
import { toast } from "sonner";

interface FilesContentProps {
  data: FileRecord[];
  totalPages: number;
  currentPage: number;
}

export function FilesContent({
  data,
  totalPages,
  currentPage,
}: FilesContentProps) {
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

  const columns: ColumnDef<FileRecord>[] = [
    {
      accessorKey: "fileName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome do Arquivo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("fileName")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => {
        return <div>{row.getValue("description")}</div>;
      },
    },
    {
      accessorKey: "fileType",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="uppercase">{row.getValue("fileType")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data de Criação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        format(new Date(row.getValue("createdAt")), "dd/MM/yyyy 'às' HH:mm", {
          locale: ptBR,
        }),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => openEditModal(row.original)}
            title="Editar arquivo"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive"
            onClick={() => openDeleteModal(row.original)}
            title="Excluir arquivo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Arquivos</h1>
          <p className="text-muted-foreground">
            Gerencie os arquivos que serão enviados
          </p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Arquivo
        </Button>
      </div>

      <CreateFileDialog isOpen={isDialogOpen} onClose={closeDialog} />
      {selectedFile && (
        <EditFileModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          file={selectedFile}
        />
      )}
      {selectedFile && (
        <DeleteFileModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteFile}
          fileName={selectedFile.fileName}
        />
      )}

      <Suspense fallback={<div>Carregando arquivos...</div>}>
        <FilesDataTable
          data={data}
          columns={columns}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
