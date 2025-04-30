"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CollaboratorModal } from "./collaborator-modal";
import { deleteCollaborator } from "@/actions/collaborators/delete-collaborator";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination";
import { useRouter } from "next/navigation";
import { Service } from "@prisma/client";
import { CollaboratorFullData } from "@/types/collaborator";

interface CollaboratorsSectionProps {
  collaborators: CollaboratorFullData[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function CollaboratorsSection({
  collaborators,
  pagination,
}: CollaboratorsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<CollaboratorFullData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const handleEdit = (collaborator: CollaboratorFullData) => {
    setSelectedCollaborator(collaborator);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteCollaborator(id);

      if (result.success) {
        toast.success("Colaborador excluído com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir colaborador");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o colaborador");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    router.push(`/collaborators?page=${page}`);
  };

  const formatServices = (services: Service[]) => {
    if (!services || services.length === 0) return "Nenhum serviço";

    return services.map((service) => service.name).join(", ");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lista de Colaboradores</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Profissão</TableHead>
              <TableHead>Serviços</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaborators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell className="font-medium">
                    {collaborator.name}
                  </TableCell>
                  <TableCell>{collaborator.phone}</TableCell>
                  <TableCell>{collaborator.profession}</TableCell>
                  <TableCell>{formatServices(collaborator.services)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(collaborator)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(collaborator.id)}
                        disabled={isDeleting}
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
        {collaborators.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">
            Nenhum colaborador encontrado
          </div>
        ) : (
          collaborators.map((collaborator) => (
            <div key={collaborator.id} className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{collaborator.name}</h3>
                  <p className="text-sm text-muted-foreground">{collaborator.phone}</p>
                  <p className="text-sm text-muted-foreground">{collaborator.profession}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatServices(collaborator.services)}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(collaborator)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(collaborator.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCollaborator(null);
          router.refresh();
        }}
        initialData={selectedCollaborator}
      />
    </div>
  );
}
