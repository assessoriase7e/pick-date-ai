"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceModal } from "./service-modal";
import { DeleteServiceModal } from "./delete-service-modal";
import { deleteService } from "@/actions/services/delete-service";
import { formatCurrency } from "@/lib/format-utils";
import { formatAvailableDays } from "@/lib/format-days";

interface ServicesSectionProps {
  services: any[];
  user: any;
}

export function ServicesSection({ services, user }: ServicesSectionProps) {
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
        // Recarregar a página para atualizar a lista
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
    // Recarregar a página para atualizar a lista
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Serviços</CardTitle>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Dias Disponíveis</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell>{formatAvailableDays(service.availableDays)}</TableCell>
                    <TableCell>{service.professionalName}</TableCell>
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

        <ServiceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialData={editingService}
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
      </CardContent>
    </Card>
  );
}
