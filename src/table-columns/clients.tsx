import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { Client } from "@prisma/client";

type ClientActionsProps = {
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  formatDate: (date: Date) => string;
};

export const createClientColumns = ({ onEdit, onDelete, formatDate }: ClientActionsProps): ColumnDef<Client>[] => [
  {
    accessorKey: "fullName",
    header: "Nome",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    accessorKey: "birthDate",
    header: "Data de Nascimento",
    cell: ({ row }) => {
      const date = row.original.birthDate;
      return date ? formatDate(date) : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex space-x-2">
          <Link href={`/clients/${client.id}/services`}>
            <Button variant="outline" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={() => onEdit(client)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(client.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];