import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Package } from "lucide-react";
import Link from "next/link";
import { Client } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

type ClientActionsProps = {
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  formatDate: (date: Date) => string;
  enableSelection?: boolean;
  clientsWithCombos?: Set<number>; // IDs dos clientes que possuem combos
};

export const createClientColumns = ({ 
  onEdit, 
  onDelete, 
  formatDate, 
  enableSelection = false,
  clientsWithCombos = new Set()
}: ClientActionsProps): ColumnDef<Client>[] => {
  const baseColumns: ColumnDef<Client>[] = [
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
        const hasPackages = clientsWithCombos.has(client.id);
        
        return (
          <div className="flex space-x-2">
            <Link href={`/clients/${client.id}/services`}>
              <Button variant="outline" size="icon">
                <FileText className="h-4 w-4" />
              </Button>
            </Link>
            {hasPackages && (
              <Link href={`/clients/${client.id}/combos`}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </Link>
            )}
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

  // Se a seleção estiver habilitada, adicionar a coluna de checkbox no início
  if (enableSelection) {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => {
          const isSelected = row.getIsSelected() === true;

          return (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value);
              }}
              aria-label="Selecionar linha"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      ...baseColumns,
    ];
  }

  return baseColumns;
};