"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteClientService } from "@/actions/clients/services/delete-client-service";

interface ClientService {
  id: string;
  clientId: string;
  serviceId: string;
  date: Date;
  service: {
    id: string;
    name: string;
  };

  isAppointment?: boolean;
  startTime?: Date;
  endTime?: Date;
  description?: string;
  status?: string;
}

interface Service {
  id: string;
  name: string;
}

interface ClientServiceWithRelations extends ClientService {
  service: Service;
  isAppointment?: boolean;
  startTime?: Date;
  endTime?: Date;
  description?: string;
  status?: string;
}

interface ClientServicesTableProps {
  clientId: string;
  clientServices: ClientServiceWithRelations[];
  services: Service[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
}

export default function ClientServicesTable({
  clientId,
  clientServices,
  pagination,
}: ClientServicesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    const result = await deleteClientService(serviceToDelete, clientId);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (result.success) {
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
      router.refresh();
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir serviço",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: ColumnDef<ClientServiceWithRelations>[] = [
    {
      accessorKey: "service.name",
      header: "Serviço",
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "time",
      header: "Horário",
      cell: ({ row }) => {
        const service = row.original;
        return service.isAppointment && service.startTime && service.endTime
          ? `${formatTime(service.startTime)} - ${formatTime(service.endTime)}`
          : "-";
      },
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => row.original.description || "-",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={clientServices}
        sortableColumns={["service.name", "date"]}
        searchPlaceholder="Buscar serviços..."
        pageSize={pagination.total}
        enablePagination={false}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
