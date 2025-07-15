"use client";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { deleteClient } from "@/actions/clients/delete-client";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import ClientForm from "./client-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Client } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import { saveClient } from "@/actions/clients/save-client";
import { ClientFormValues } from "@/validators/client";
import { createClientColumns } from "@/table-columns/clients";
import { SubscriptionBlocker } from "@/components/subscription-blocker";
import { hasClientCombos } from "@/actions/combos/get-client-combos";

interface ClientsTableProps {
  clients: Client[];
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
}

export default function ClientsTable({ clients, pagination = { totalPages: 1, currentPage: 1 } }: ClientsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [clientsWithCombos, setClientsWithCombos] = useState<Set<number>>(new Set());
  const selectedRowsRef = useRef<any[]>([]);

  // Verificar quais clientes possuem combos
  useEffect(() => {
    const checkClientCombos = async () => {
      const clientsWithCombosSet = new Set<number>();
      
      await Promise.all(
        clients.map(async (client) => {
          const hasCombos = await hasClientCombos(client.id);
          if (hasCombos) {
            clientsWithCombosSet.add(client.id);
          }
        })
      );
      
      setClientsWithCombos(clientsWithCombosSet);
    };

    if (clients.length > 0) {
      checkClientCombos();
    }
  }, [clients]);

  const handleDeleteClick = (id: number) => {
    setClientToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (client: Client) => {
    setClientToEdit(client);
    setIsEditClientDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    const result = await deleteClient(clientToDelete);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (result.success) {
      toast.success("O cliente foi excluído com sucesso.");
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao excluir cliente");
    }
  };

  const handleSaveClient = async (data: ClientFormValues) => {
    setIsSaving(true);
    const result = await saveClient(data);
    setIsSaving(false);

    if (result.success) {
      toast.success("Cliente salvo com sucesso");
      handleClientFormSuccess();
    } else {
      toast.error(result.error || "Erro ao salvar cliente");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleClientFormSuccess = () => {
    setIsNewClientDialogOpen(false);
    setIsEditClientDialogOpen(false);
    router.refresh();
  };

  const columns = createClientColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    formatDate,
    enableSelection: false,
    clientsWithCombos,
  });

  // Botão de criação que será passado para o DataTable
  const createButton = (
    <SubscriptionBlocker
      buttonText="Novo Cliente"
      modalDescription="Para adicionar novos clientes, você precisa ter uma assinatura ativa, ser um usuário vitalício ou estar em período de teste."
    >
      <Button onClick={() => setIsNewClientDialogOpen(true)} className="w-full lg:w-min">
        <Users className="mr-2 h-4 w-4" />
        Novo Cliente
      </Button>
    </SubscriptionBlocker>
  );

  // Definir as colunas filtráveis
  const filterableColumns = [
    { id: "all", title: "Todos os campos", prismaField: "" },
    { id: "fullName", title: "Nome", prismaField: "fullName" },
    { id: "phone", title: "Telefone", prismaField: "phone" },
  ];

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={clients}
        enableSorting={true}
        enableFiltering={true}
        filterPlaceholder="Buscar clientes..."
        initialSorting={[{ id: "fullName", desc: false }]}
        emptyMessage="Nenhum cliente encontrado."
        syncWithQueryParams={true}
        totalPages={pagination.totalPages}
        currentPage={pagination.currentPage}
        onPageChange={handlePageChange}
        createButton={createButton}
        enableColumnFilter={true}
        filterableColumns={filterableColumns}
      />

      <ConfirmationDialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
        title="Novo Cliente"
        showFooter={false}
      >
        <ClientForm onSubmit={handleSaveClient} onCancel={() => setIsNewClientDialogOpen(false)} isSaving={isSaving} />
      </ConfirmationDialog>

      <ConfirmationDialog
        open={isEditClientDialogOpen}
        onOpenChange={setIsEditClientDialogOpen}
        title="Editar Cliente"
        size="lg"
        showFooter={false}
      >
        <ClientForm
          initialData={clientToEdit}
          onSubmit={handleSaveClient}
          onCancel={() => setIsEditClientDialogOpen(false)}
          isSaving={isSaving}
        />
      </ConfirmationDialog>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmText={isDeleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  );
}
