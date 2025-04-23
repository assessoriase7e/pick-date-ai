"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkModal } from "./link-modal";
import { DeleteLinkModal } from "./delete-link-modal";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLinks } from "@/hooks/use-links";
import { createLink } from "@/actions/links/create";
import { updateLink } from "@/actions/links/update";
import { deleteLink } from "@/actions/links/delete";
import { toast } from "sonner";
import { truncateText } from "@/lib/utils";

export function LinksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { links, totalPages, isLoading, mutate } = useLinks(page, 10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [deletingLink, setDeletingLink] = useState<any | null>(null);

  async function handleCreateLink(data: any) {
    try {
      const result = await createLink(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      mutate();
      setIsCreateModalOpen(false);
      toast("Link criado com sucesso!");
    } catch (error) {
      console.error("Error creating link:", error);
      throw error;
    }
  }

  async function handleUpdateLink(data: any) {
    try {
      if (!editingLink) return;

      const result = await updateLink(editingLink.id, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      mutate();
      setEditingLink(null);
      toast("Link atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating link:", error);
      throw error;
    }
  }

  async function handleDeleteLink() {
    try {
      if (!deletingLink) return;

      const result = await deleteLink(deletingLink.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      mutate();
      setDeletingLink(null);
      toast("Link excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting link:", error);
      throw error;
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/links?page=${newPage}`);
  }

  function openExternalLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo link
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Nenhum link encontrado.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link: any) => (
                <TableRow key={link.id}>
                  <TableCell>{link.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="truncate max-w-[200px]">{link.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>{truncateText(link.description, 30)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openExternalLink(link.url)}
                        title="Abrir link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingLink(link)}
                        title="Editar link"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingLink(link)}
                        title="Excluir link"
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

      <LinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo link"
        description="Adicione um novo link ao sistema."
        onSubmit={handleCreateLink}
      />

      {editingLink && (
        <LinkModal
          isOpen={!!editingLink}
          onClose={() => setEditingLink(null)}
          title="Editar link"
          description="Edite as informações do link."
          initialData={{
            url: editingLink.url,
            title: editingLink.title,
            description: editingLink.description,
          }}
          onSubmit={handleUpdateLink}
        />
      )}

      {deletingLink && (
        <DeleteLinkModal
          isOpen={!!deletingLink}
          onClose={() => setDeletingLink(null)}
          onConfirm={handleDeleteLink}
          linkTitle={deletingLink.title}
        />
      )}
    </div>
  );
}