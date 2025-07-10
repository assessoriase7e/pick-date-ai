"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkModal } from "./link-modal";
import { LinkIcon } from "lucide-react";
import { createLink } from "@/actions/links/create";
import { updateLink } from "@/actions/links/update";
import { deleteLink } from "@/actions/links/delete";
import { toast } from "sonner";
import { Link } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { createLinkColumns } from "@/table-columns/links";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type LinksContentProps = {
  links: Link[];
  totalPages: number;
  currentPage: number;
  userId: string;
};

export function LinksContent({ links, totalPages, currentPage, userId }: LinksContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  async function handleCreateLink(data: Link) {
    try {
      setIsLoading(true);
      const result = await createLink(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsCreateModalOpen(false);
      toast("Link criado com sucesso!");
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Erro ao criar link");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateLink(data: any) {
    try {
      setIsLoading(true);
      if (!editingLink) return;

      const result = await updateLink(editingLink.id, userId!, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      setEditingLink(null);
      toast("Link atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Erro ao atualizar link");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteLink() {
    try {
      setIsLoading(true);
      if (!deletingLink) return;

      const result = await deleteLink(deletingLink.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      setDeletingLink(null);
      toast("Link excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Erro ao excluir link");
    } finally {
      setIsLoading(false);
    }
  }

  function openExternalLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Definir as colunas filtráveis
  const filterableColumns = [
    { id: "all", title: "Todos os campos", prismaField: "" },
    { id: "title", title: "Título", prismaField: "title" },
    { id: "url", title: "URL", prismaField: "url" },
    { id: "description", title: "Descrição", prismaField: "description" },
  ];

  const columns = createLinkColumns({
    onEdit: setEditingLink,
    onDelete: setDeletingLink,
    onOpenExternal: openExternalLink,
  });

  // Botão de criação que será passado para o DataTable
  const createButton = (
    <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-min">
      <LinkIcon className="mr-2 h-4 w-4 " /> Novo link
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Desktop View usando DataTable */}

      <DataTable
        columns={columns}
        data={links}
        enableSorting={true}
        enableFiltering={true}
        filterPlaceholder="Buscar links..."
        enableRowSelection={true}
        initialSorting={[{ id: "title", desc: false }]}
        emptyMessage="Nenhum link encontrado."
        syncWithQueryParams={true}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        createButton={createButton}
        enableColumnFilter={true}
        filterableColumns={filterableColumns}
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
        <ConfirmationDialog
          open={!!deletingLink}
          onOpenChange={() => setDeletingLink(null)}
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir o link ${deletingLink.title}? Esta ação não pode ser desfeita.`}
          confirmText={isLoading ? "Excluindo..." : "Excluir"}
          cancelText="Cancelar"
          onConfirm={handleDeleteLink}
          variant="destructive"
        />
      )}
    </div>
  );
}
