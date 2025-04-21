"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfessionalModal } from "@/components/professionals/professional-modal";
import { DeleteProfessionalModal } from "@/components/professionals/delete-professional-modal";
import { formatPhoneNumber } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { Professional } from "@prisma/client";
import { createProfessional } from "@/actions/professionals/create";
import { updateProfessional } from "@/actions/professionals/update";
import { deleteProfessional } from "@/actions/professionals/delete";
import { listProfessionals } from "@/actions/professionals/getMany";

export function ProfessionalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] =
    useState<Professional | null>(null);

  async function loadProfessionals() {
    setIsLoading(true);
    const result = await listProfessionals(page);

    if (result.success) {
      setProfessionals(result.data.professionals);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  }

  async function handleCreateProfessional(data: any) {
    const result = await createProfessional(data);
    if (result.success) {
      loadProfessionals();
      setIsCreateModalOpen(false);
    } else {
      throw new Error(result.error);
    }
  }

  async function handleUpdateProfessional(data: any) {
    if (!editingProfessional) return;

    const result = await updateProfessional(editingProfessional.id, data);
    if (result.success) {
      loadProfessionals();
      setEditingProfessional(null);
    } else {
      throw new Error(result.error);
    }
  }

  async function handleDeleteProfessional() {
    if (!deletingProfessional) return;

    const result = await deleteProfessional(deletingProfessional.id);
    if (result.success) {
      loadProfessionals();
      setDeletingProfessional(null);
    } else {
      throw new Error(result.error);
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/professionals?page=${newPage}`);
  }

  useEffect(() => {
    loadProfessionals();
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo profissional
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do profissional</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Nome da empresa</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : professionals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Nenhum profissional encontrado.
                </TableCell>
              </TableRow>
            ) : (
              professionals.map((professional: Professional) => (
                <TableRow key={professional.id}>
                  <TableCell>{professional.name}</TableCell>
                  <TableCell>{formatPhoneNumber(professional.phone)}</TableCell>
                  <TableCell>{professional.company}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingProfessional(professional)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingProfessional(professional)}
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      <ProfessionalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo profissional"
        description="Adicione um novo profissional ao sistema."
        onSubmit={handleCreateProfessional}
      />

      {editingProfessional && (
        <ProfessionalModal
          isOpen={!!editingProfessional}
          onClose={() => setEditingProfessional(null)}
          title="Editar profissional"
          description="Edite as informações do profissional."
          initialData={{
            name: editingProfessional.name,
            phone: editingProfessional.phone,
            company: editingProfessional.company,
          }}
          onSubmit={handleUpdateProfessional}
        />
      )}

      {deletingProfessional && (
        <DeleteProfessionalModal
          isOpen={!!deletingProfessional}
          onClose={() => setDeletingProfessional(null)}
          onConfirm={handleDeleteProfessional}
          professionalName={deletingProfessional.name}
        />
      )}
    </div>
  );
}
