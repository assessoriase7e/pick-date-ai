import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { CollaboratorFullData } from "@/types/collaborator";

type CollaboratorActionsProps = {
  onEdit: (collaborator: CollaboratorFullData) => void;
  onDelete: (collaboratorId: number) => void;
  isDeleting: boolean;
};

export const createCollaboratorColumns = ({
  onEdit,
  onDelete,
  isDeleting,
}: CollaboratorActionsProps): ColumnDef<CollaboratorFullData>[] => [
  {
    id: "name",
    header: "Nome",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    id: "phone",
    header: "Telefone",
    accessorKey: "phone",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    id: "profession",
    header: "Profissão",
    accessorKey: "profession",
    cell: ({ row }) => <div>{row.getValue("profession")}</div>,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const collaborator = row.original;
      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/collaborators/${collaborator.id}/services`}>
              <FileText className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="outline" size="icon" onClick={() => onEdit(collaborator)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(collaborator.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
