"use client";

import { useState } from "react";
import { Pencil, Trash2, Scissors } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceModal } from "./service-modal";
import { DeleteServiceModal } from "./delete-service-modal";
import { deleteService } from "@/actions/services/delete-service";
import { formatCurrency } from "@/lib/format-utils";
import { formatAvailableDays } from "@/lib/format-days";
import { Pagination } from "@/components/ui/pagination";
import { Collaborator } from "@prisma/client";
import { ServiceFullData } from "@/types/service";

interface ServicesSectionProps {
  services: ServiceFullData[];
  collaborators: Collaborator[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function ServicesSection({
  services,
  collaborators,
  pagination,
}: ServicesSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [deletingService, setDeletingService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deleteService(id);

      if (result.success) {
        toast.success("Serviço excluído com sucesso");
        setDeletingService(null);
        window.location.reload();
      } else {
        toast.error(result.error || "Erro ao excluir serviço");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o serviço");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingService(null);
    window.location.reload();
  };

  const handlePageChange = (page: number) => {
    router.push(`/services?page=${page}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Scissors className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Dias Disponíveis</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="font-medium">
                    {service.durationMinutes} Min
                  </TableCell>
                  <TableCell>{formatCurrency(service.price)}</TableCell>
                  <TableCell>
                    {formatAvailableDays(service.availableDays)}
                  </TableCell>
                  <TableCell>{service.collaborator?.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingService(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-10 rounded-lg border p-4">
            Nenhum serviço encontrado.
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-500">
                    {service.collaborator?.name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeletingService(service)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Duração:</span>
                  <p>{service.durationMinutes} Min</p>
                </div>
                <div>
                  <span className="text-gray-500">Preço:</span>
                  <p>{formatCurrency(service.price)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Dias Disponíveis:</span>
                  <p>{formatAvailableDays(service.availableDays)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={editingService}
        collaborators={collaborators}
      />

      {deletingService && (
        <DeleteServiceModal
          isOpen={!!deletingService}
          onClose={() => setDeletingService(null)}
          onConfirm={() => handleDelete(deletingService.id)}
          serviceName={deletingService.name}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
