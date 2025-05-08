"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Search, ArrowUpDown } from "lucide-react";
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
import { useRouter, usePathname } from "next/navigation";
import { Service } from "@prisma/client";
import { CollaboratorFullData } from "@/types/collaborator";
import { CollaboratorServicesDialog } from "./collaborator-services-dialog";
import { Input } from "@/components/ui/input";
import { ServiceFullData } from "@/types/service";
import { useDebounce } from "@/hooks/use-debounce";
import { revalidatePathAction } from "@/actions/revalidate-path";
import IsTableLoading from "../isTableLoading";
import Link from "next/link";

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
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<CollaboratorFullData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    initialFilters?.searchTerm || ""
  );
  const [serviceFilter, setServiceFilter] = useState(
    initialFilters?.serviceFilter || "all"
  );
  const [sortField, setSortField] = useState<SortField>(
    initialFilters?.sortField || "name"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialFilters?.sortDirection || "asc"
  );
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

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteCollaborator(id);

      if (result.success) {
        toast.success("Profissional excluído com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir profissional");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o profissional");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    updateUrl(page);
  };

  // Efeito para detectar quando a página foi totalmente carregada
  useEffect(() => {
    if (isPageChanging) {
      setIsPageChanging(false);
    }
  }, [collaborators]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleShowServices = (collaborator: CollaboratorFullData) => {
    const services = collaborator?.ServiceCollaborator?.map((sc) => sc.service);
    setSelectedServices(services || []);
    setIsServicesDialogOpen(true);
  };

  const SortableHeader = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <ArrowUpDown
            className={`ml-1 h-4 w-4 ${
              sortDirection === "desc" ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar profissionais..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block relative">
        <IsTableLoading isPageChanging={isPageChanging} />
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name" label="Nome" />
              <SortableHeader field="phone" label="Telefone" />
              <SortableHeader field="profession" label="Profissão" />
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaborators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhum profissional encontrado.
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

                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link
                          href={`/collaborators/${collaborator.id}/services`}
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>

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
            Nenhum profissional encontrado
          </div>
        ) : (
          collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="rounded-md border p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{collaborator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.profession}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowServices(collaborator)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Serviços
                  </Button>
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

      <CollaboratorServicesDialog
        open={isServicesDialogOpen}
        onOpenChange={setIsServicesDialogOpen}
        services={selectedServices}
      />
    </div>
  );
}
