"use client";
import { useState, useEffect } from "react";
import { Scissors, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ServiceModal } from "./service-modal";
import { deleteService } from "@/actions/services/delete-service";
import { Collaborator, Service } from "@prisma/client";
import { ServiceFullData } from "@/types/service";
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
import { revalidatePathAction } from "@/actions/revalidate-path";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/data-table";
import { createServiceColumns } from "@/table-columns/services";
import { ConfirmationDialog } from "../ui/confirmation-dialog";

interface ServicesSectionProps {
  services: ServiceFullData[];
  collaborators: Collaborator[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  initialFilters?: {
    searchTerm: string;
    collaboratorFilter: string;
    sortField: SortField;
    sortDirection: SortDirection;
  };
}

type SortField = "name" | "price" | "durationMinutes" | "commission";
type SortDirection = "asc" | "desc";

export function ServicesSection({
  services,
  collaborators,
  pagination: initialPagination,
  initialFilters,
}: ServicesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    action: () => Promise<void>;
    message: string;
  }>({ show: false, action: async () => {}, message: "" });

  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || "");
  const [collaboratorFilter, setCollaboratorFilter] = useState(initialFilters?.collaboratorFilter || "all");
  const [sortField, setSortField] = useState<SortField>(initialFilters?.sortField || "name");
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialFilters?.sortDirection || "asc");
  const [pagination, setPagination] = useState(initialPagination);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sincronizar o estado interno com as props
  useEffect(() => {
    setPagination(initialPagination);
  }, [initialPagination]);

  // Atualizar a URL quando os filtros mudarem
  useEffect(() => {
    if (
      debouncedSearchTerm === initialFilters?.searchTerm &&
      collaboratorFilter === initialFilters?.collaboratorFilter &&
      sortField === initialFilters?.sortField &&
      sortDirection === initialFilters?.sortDirection
    ) {
      return;
    }

    updateUrl(1);
  }, [debouncedSearchTerm, collaboratorFilter, sortField, sortDirection]);

  const updateUrl = (page: number) => {
    const params = new URLSearchParams();

    if (page !== 1) {
      params.set("page", String(page));
    }

    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    }

    if (collaboratorFilter !== "all") {
      params.set("collaborator", collaboratorFilter);
    }

    if (sortField !== "name") {
      params.set("sortField", sortField);
    }

    if (sortDirection !== "asc") {
      params.set("sortDirection", sortDirection);
    }

    const query = params.toString();
    const url = `${pathname}${query ? `?${query}` : ""}`;

    revalidatePathAction("/services");
    router.push(url);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      const result = await deleteService(id);

      if (result.success) {
        toast.success("Serviço excluído com sucesso");
        setDeletingService(null);
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
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Função para lidar com a mudança de seleção de linhas
  const handleRowSelectionChange = (selection: Record<string, boolean>) => {
    const selectedIds = Object.keys(selection).filter((id) => selection[id]);
    // Você pode adicionar lógica adicional aqui se necessário
  };

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    updateUrl(page);
  };

  // Definir as colunas filtráveis
  const filterableColumns = [
    { id: "all", title: "Todos os campos", prismaField: "" },
    { id: "name", title: "Nome do Serviço", prismaField: "name" },
    { id: "price", title: "Preço", prismaField: "price" },
    { id: "durationMinutes", title: "Duração", prismaField: "durationMinutes" },
    { id: "commission", title: "Comissão", prismaField: "commission" },
  ];

  // Criar colunas para o DataTable
  const columns = createServiceColumns({
    onEdit: handleEdit,
    onDelete: (service) => setDeletingService(service),
  });

  // Botão de criação que será passado para o DataTable
  const createButton = (
    <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-min">
      <Scissors className="mr-2 h-4 w-4" /> Novo Serviço
    </Button>
  );

  return (
    <div className="lg:space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col lg:!flex-row items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços cadastrados</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={services}
        enableSorting={true}
        enableFiltering={true}
        filterPlaceholder="Buscar serviços..."
        enableRowSelection={true}
        onRowSelectionChange={handleRowSelectionChange}
        initialSorting={[{ id: sortField, desc: sortDirection === "desc" }]}
        emptyMessage="Nenhum serviço encontrado."
        syncWithQueryParams={true}
        totalPages={pagination.totalPages}
        currentPage={pagination.currentPage}
        onPageChange={handlePageChange}
        createButton={createButton}
        enableColumnFilter={true}
        filterableColumns={filterableColumns}
      />

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={editingService}
        collaborators={collaborators}
      />

      {deletingService && (
        <ConfirmationDialog
          open={!!deletingService}
          onOpenChange={() => setDeletingService(null)}
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir o serviço ${deletingService.name}? Esta ação não pode ser desfeita.`}
          confirmText={isLoading ? "Excluindo..." : "Excluir"}
          cancelText="Cancelar"
          onConfirm={() => handleDelete(deletingService.id)}
          variant="destructive"
        />
      )}

      {/* Diálogo de confirmação para ações */}
      <AlertDialog
        open={confirmAction.show}
        onOpenChange={(open) => !open && setConfirmAction({ ...confirmAction, show: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setIsLoading(true);
                await confirmAction.action();
                setIsLoading(false);
                setConfirmAction({ ...confirmAction, show: false });
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
