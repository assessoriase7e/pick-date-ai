import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileRecord } from "@prisma/client";
import Link from "next/link";

type FileActionsProps = {
  onEdit: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
};

export const createFileColumns = ({ onEdit, onDelete }: FileActionsProps): ColumnDef<FileRecord>[] => [
  {
    accessorKey: "fileName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome do Arquivo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const fileName = row.getValue("fileName") as string;
      return <div className="font-medium">{fileName}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div>{description}</div>;
    },
  },
  {
    accessorKey: "fileType",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const fileType = row.getValue("fileType") as string;
      return <div className="uppercase">{fileType}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data de Criação
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div>
          {format(new Date(date), "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(row.original)} title="Editar arquivo">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive"
          onClick={() => onDelete(row.original)}
          title="Excluir arquivo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Link href={row.original.fileUrl} target="_blank">
          <Button variant="outline" size="icon" title="Baixar arquivo">
            <Download className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];
