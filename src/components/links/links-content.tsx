"use client";

import { useState, useEffect } from "react";
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
import { createLink } from "@/actions/links/create";
import { updateLink } from "@/actions/links/update";
import { deleteLink } from "@/actions/links/delete";
import { listLinks } from "@/actions/links/getMany";
import { toast } from "sonner";
import { truncateText } from "@/lib/utils";
import { Link } from "@prisma/client";

export function LinksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const [links, setLinks] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [deletingLink, setDeletingLink] = useState<any | null>(null);

  // Fetch links using server action
  useEffect(() => {
    async function fetchLinks() {
      setIsLoading(true);
      try {
        const result = await listLinks(page, 10);
        if (result.success && result.data) {
          setLinks(result.data.links);
          setTotalPages(result.data.totalPages);
        } else {
          toast.error("Erro ao carregar links");
        }
      } catch (error) {
        console.error("Error fetching links:", error);
        toast.error("Erro ao carregar links");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinks();
  }, [page]);

  async function handleCreateLink(data: any) {
    try {
      const result = await createLink(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh links after creating
      const linksResult = await listLinks(page, 10);
      if (linksResult.success && linksResult.data) {
        setLinks(linksResult.data.links);
        setTotalPages(linksResult.data.totalPages);
      }

      setIsCreateModalOpen(false);
      toast("Link criado com sucesso!");
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Erro ao criar link");
    }
  }

  async function handleUpdateLink(data: any) {
    try {
      if (!editingLink) return;

      const result = await updateLink(editingLink.id, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh links after updating
      const linksResult = await listLinks(page, 10);
      if (linksResult.success && linksResult.data) {
        setLinks(linksResult.data.links);
        setTotalPages(linksResult.data.totalPages);
      }

      setEditingLink(null);
      toast("Link atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Erro ao atualizar link");
    }
  }

  async function handleDeleteLink() {
    try {
      if (!deletingLink) return;

      const result = await deleteLink(deletingLink.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh links after deleting
      const linksResult = await listLinks(page, 10);
      if (linksResult.success && linksResult.data) {
        setLinks(linksResult.data.links);
        setTotalPages(linksResult.data.totalPages);
      }

      setDeletingLink(null);
      toast("Link excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Erro ao excluir link");
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
                <TableCell colSpan={5} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhum link encontrado.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link: Link) => (
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
        title="Criar Link"
        description="Adicione um novo link ao sistema."
        onSubmit={handleCreateLink}
      />

      {editingLink && (
        <LinkModal
          isOpen={!!editingLink}
          onClose={() => setEditingLink(null)}
          title="Editar Link"
          description="Atualize as informações do link."
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
