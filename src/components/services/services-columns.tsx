import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-utils";
import { formatAvailableDays } from "@/lib/format-days";
import { ServiceFullData } from "@/types/service";
import { Collaborator } from "@prisma/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ServiceActionsProps = {
  onEdit: (service: ServiceFullData) => void;
  onDelete: (service: ServiceFullData) => void;
};

const formatCollaborators = (service: ServiceFullData) => {
  const allCollaborators = [] as Collaborator[];

  if (
    service.serviceCollaborators &&
    Array.isArray(service.serviceCollaborators)
  ) {
    service.serviceCollaborators.forEach((sc) => {
      if (!allCollaborators.some((c) => c.id === sc.collaborator.id)) {
        allCollaborators.push(sc.collaborator);
      }
    });
  }

  if (allCollaborators.length === 0) {
    return "Nenhum";
  }

  if (allCollaborators.length === 1) {
    return allCollaborators[0].name;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-pointer">
              <Users className="h-3 w-3 mr-1" />
              {allCollaborators.length} profissionais
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <ul className="text-xs">
              {allCollaborators.map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const getStatusBadge = (service: ServiceFullData) => {
  const isActive = service.availableDays && service.availableDays.length > 0;

  return (
    <Badge variant={isActive ? "default" : "destructive"}>
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
};

export const createServiceColumns = ({
  onEdit,
  onDelete,
}: ServiceActionsProps): ColumnDef<ServiceFullData>[] => [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "durationMinutes",
    header: "Tempo",
    cell: ({ row }) => <div>{row.getValue("durationMinutes")} Min</div>,
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "commission",
    header: "Comissão",
    cell: ({ row }) => `${row.getValue("commission")}%`,
  },
  {
    accessorKey: "availableDays",
    header: "Dias Disponíveis",
    cell: ({ row }) => formatAvailableDays(row.original.availableDays),
  },
  {
    id: "collaborators",
    header: "Profissionais",
    cell: ({ row }) => formatCollaborators(row.original),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const service = row.original;

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(service)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(service)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
