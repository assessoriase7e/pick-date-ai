"use client";
import { FileRecord } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, FileEdit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteFile } from "@/actions/files/delete";
import { Row } from "@tanstack/react-table";

interface FilesDataTableProps {
  data: FileRecord[];
}

export function FilesDataTable({ data }: FilesDataTableProps) {
  const router = useRouter();

  const handleDownload = async (file: FileRecord) => {
    try {
      window.open(file.fileUrl, "_blank");
    } catch (error) {
      toast.error("Erro ao baixar o arquivo");
    }
  };

  const handleEdit = (file: FileRecord) => {
    router.push(`/files/${file.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteFile(id);
      if (result.success) {
        toast.success("Arquivo excluído com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir arquivo");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o arquivo");
    }
  };

  const columns = [
    {
      accessorKey: "fileName",
      header: "Nome do Arquivo",
    },
    {
      accessorKey: "description",
      header: "Descrição",
    },
    {
      accessorKey: "fileType",
      header: "Tipo",
      cell: ({ row }: { row: Row<FileRecord> }) => (
        <div className="uppercase">{row.getValue("fileType")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Data de Criação",
      cell: ({ row }: { row: Row<FileRecord> }) => (
        <div>
          {format(
            new Date(row.getValue("createdAt")),
            "dd/MM/yyyy 'às' HH:mm",
            {
              locale: ptBR,
            }
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<FileRecord> }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDownload(row.original)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      sortableColumns={["fileName", "fileType", "createdAt"]}
      searchPlaceholder="Filtrar arquivos..."
      pageSize={10}
    />
  );
}
