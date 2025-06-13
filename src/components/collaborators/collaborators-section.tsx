"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Pencil, Trash2 } from "lucide-react";
import { CollaboratorModal } from "./collaborator-modal";
import { deleteCollaborator } from "@/actions/collaborators/delete-collaborator";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { Service } from "@prisma/client";
import { CollaboratorFullData } from "@/types/collaborator";
import { CollaboratorServicesDialog } from "./collaborator-services-dialog";
import { ServiceFullData } from "@/types/service";
import { useDebounce } from "@/hooks/use-debounce";
import { revalidatePathAction } from "@/actions/revalidate-path";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface CollaboratorsSectionProps {
  collaborators: CollaboratorFullData[];
  services: ServiceFullData[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  initialFilters?: {
    searchTerm: string;
    serviceFilter: string;
    sortField: SortField;
    sortDirection: SortDirection;
  };
}

type SortField = "name" | "phone" | "profession" | "createdAt";
type SortDirection = "asc" | "desc";

export function CollaboratorsSection({
  collaborators,
  pagination: initialPagination,
  initialFilters,
}: CollaboratorsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<CollaboratorFullData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || "");
  const [serviceFilter, setServiceFilter] = useState(initialFilters?.serviceFilter || "all");
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
      serviceFilter === initialFilters?.serviceFilter &&
      sortField === initialFilters?.sortField &&
      sortDirection === initialFilters?.sortDirection
    ) {
      return;
    }

    updateUrl(1);
  }, [debouncedSearchTerm, serviceFilter, sortField, sortDirection]);

  const updateUrl = (page: number) => {
    const params = new URLSearchParams();

    if (page !== 1) {
      params.set("page", String(page));
    }

    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    }

    if (serviceFilter !== "all") {
      params.set("service", serviceFilter);
    }

    if (sortField !== "name") {
      params.set("sortField", sortField);
    }

    if (sortDirection !== "asc") {
      params.set("sortDirection", sortDirection);
    }

    const query = params.toString();
    const url = `${pathname}${query ? `?${query}` : ""}`;

    setIsPageChanging(true);
    revalidatePathAction("/collaborators");
    router.push(url);
  };

  const handleEdit = (collaborator: CollaboratorFullData) => {
    setSelectedCollaborator(collaborator);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      const result = await deleteCollaborator(id);

      if (result.success) {
        toast.success("Profissional excluído com sucesso");
        revalidatePathAction("/collaborators");
      } else {
        toast.error(result.error || "Erro ao excluir profissional");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o profissional");
    } finally {
      setIsDeleting(false);
    }
  };
  // Efeito para detectar quando a página foi totalmente carregada
  useEffect(() => {
    if (isPageChanging) {
      setIsPageChanging(false);
    }
  }, [collaborators]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Definir as colunas da tabela
  const columns: ColumnDef<CollaboratorFullData>[] = [
    {
      id: "name",
      header: "Nome",
      accessorKey: "name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      id: "phone",
      header: "Telefone",
      accessorKey: "phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      id: "profession",
      header: "Profissão",
      accessorKey: "profession",
      cell: ({ row }) => <div>{row.getValue("profession")}</div>,
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const collaborator = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/collaborators/${collaborator.id}/services`}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" size="icon" onClick={() => handleEdit(collaborator)}>
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
        );
      },
    },
  ];

  return (
    <div className="space-y-4 relative">
      <DataTable
        columns={columns}
        data={collaborators}
        sortableColumns={["name", "phone", "profession"]}
        enableSearch={true}
        searchPlaceholder="Buscar profissionais..."
        pagination={pagination}
        onSearch={handleSearch}
        isloading={isPageChanging}
        headerContent={
          <Button onClick={() => setIsModalOpen(true)} className="w-full lg:w-min">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Profissional
          </Button>
        }
      />

      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCollaborator(null);
          revalidatePathAction("/collaborators");
        }}
        initialData={selectedCollaborator}
      />

      <CollaboratorServicesDialog
        open={isServicesDialogOpen}
        onOpenChange={setIsServicesDialogOpen}
        services={selectedServices}
      />
    </div>
  );
}
