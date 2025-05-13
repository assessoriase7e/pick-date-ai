"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { deleteClientService } from "@/actions/clients/services/delete-client-service";
import { useToast } from "@/components/ui/use-toast";
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
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

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

  const handlePageChange = (page: number) => {
    router.push(`/clients/${clientId}/services?page=${page}`);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Visualização Desktop */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientServices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                clientServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.service.name}</TableCell>
                    <TableCell>{formatDate(service.date)}</TableCell>
                    <TableCell>
                      {service.isAppointment &&
                      service.startTime &&
                      service.endTime
                        ? `${formatTime(service.startTime)} - ${formatTime(
                            service.endTime
                          )}`
                        : "-"}
                    </TableCell>
                    <TableCell>{service.description || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Visualização Mobile */}
        <div className="md:hidden space-y-4">
          {clientServices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground rounded-md border">
              Nenhum serviço encontrado
            </div>
          ) : (
            clientServices.map((clientService) => (
              <div
                key={clientService.id}
                className="rounded-md border p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {clientService.service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(clientService.date)}
                    </p>
                    {clientService.description && (
                      <p className="text-sm text-muted-foreground">
                        {clientService.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      </div>

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
