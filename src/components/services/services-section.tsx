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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // Criar colunas para o DataTable
  const columns = createServiceColumns({
    onEdit: handleEdit,
    onDelete: (service) => setDeletingService(service),
  });

  // Conteúdo do cabeçalho da tabela (filtro de colaboradores e botão de novo serviço)
  const headerContent = (
    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-min">
      <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
        <SelectTrigger className="w-full md:max-w-[250px]">
          <SelectValue placeholder="Filtrar por profissional" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os profissionais</SelectItem>
          {collaborators.map((collaborator) => (
            <SelectItem key={collaborator.id} value={String(collaborator.id)}>
              {collaborator.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-min">
        <Scissors className="mr-2 h-4 w-4" /> Novo Serviço
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 relative">
      <DataTable
        columns={columns}
        data={services}
        sortableColumns={["name", "price", "durationMinutes", "commission"]}
        headerContent={headerContent}
        enableSearch={true}
        searchPlaceholder="Buscar serviços..."
        pagination={pagination}
        onSearch={handleSearch}
        // Adicionar estas propriedades para implementar a ordenação
        initialSorting={[{ id: sortField, desc: sortDirection === "desc" }]}
        onSortingChange={(sorting) => {
          if (sorting.length > 0) {
            setSortField(sorting[0].id as SortField);
            setSortDirection(sorting[0].desc ? "desc" : "asc");
          } else {
            setSortField("name");
            setSortDirection("asc");
          }
        }}
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
