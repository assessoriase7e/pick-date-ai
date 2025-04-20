"use client";

import { useState } from "react";
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
import { useProfessionals } from "./use-professionals";
import { Professional } from "@prisma/client";

export function ProfessionalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { professionals, totalPages, isLoading, mutate } =
    useProfessionals(page);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any | null>(
    null
  );
  const [deletingProfessional, setDeletingProfessional] = useState<any | null>(
    null
  );

  async function handleCreateProfessional(data: any) {
    try {
      const response = await fetch("/api/professionals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create professional");
      }

      mutate();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating professional:", error);
      throw error;
    }
  }

  async function handleUpdateProfessional(data: any) {
    try {
      const response = await fetch(
        `/api/professionals/${editingProfessional.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update professional");
      }

      mutate();
      setEditingProfessional(null);
    } catch (error) {
      console.error("Error updating professional:", error);
      throw error;
    }
  }

  async function handleDeleteProfessional() {
    try {
      const response = await fetch(
        `/api/professionals/${deletingProfessional.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete professional");
      }

      mutate();
      setDeletingProfessional(null);
    } catch (error) {
      console.error("Error deleting professional:", error);
      throw error;
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/clients?page=${newPage}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
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

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

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
