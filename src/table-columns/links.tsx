import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Link } from "@prisma/client";
import { truncateText } from "@/lib/utils";

type LinkActionsProps = {
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onOpenExternal: (url: string) => void;
};

export const createLinkColumns = ({ onEdit, onDelete, onOpenExternal }: LinkActionsProps): ColumnDef<Link>[] => [
  {
    header: "Título",
    accessorKey: "title",
  },
  {
    header: "URL",
    accessorKey: "url",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className="truncate max-w-[200px]">{row.original.url}</span>
      </div>
    ),
  },
  {
    header: "Descrição",
    accessorKey: "description",
    cell: ({ row }) => truncateText(row.original.description, 30),
  },
  {
    header: "Ações",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="outline" size="icon" onClick={() => onOpenExternal(row.original.url)} title="Abrir link">
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onEdit(row.original)} title="Editar link">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive"
          onClick={() => onDelete(row.original)}
          title="Excluir link"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
