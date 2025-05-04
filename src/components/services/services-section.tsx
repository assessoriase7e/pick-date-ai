"use client";

import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Scissors,
  Users,
  Search,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceModal } from "./service-modal";
import { DeleteServiceModal } from "./delete-service-modal";
import { deleteService } from "@/actions/services/delete-service";
import { formatCurrency } from "@/lib/format-utils";
import { formatAvailableDays } from "@/lib/format-days";
import { Pagination } from "@/components/ui/pagination";
import { Collaborator, Service } from "@prisma/client";
import { ServiceFullData } from "@/types/service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ServicesSectionProps {
  services: ServiceFullData[];
  collaborators: Collaborator[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

type SortField = "name" | "price" | "durationMinutes" | "commission";
type SortDirection = "asc" | "desc";

export function ServicesSection({
  services: initialServices,
  collaborators,
  pagination,
}: ServicesSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    action: () => Promise<void>;
    message: string;
  }>({ show: false, action: async () => {}, message: "" });

  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorFilter, setCollaboratorFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [services, setServices] = useState<ServiceFullData[]>(initialServices);

  // Aplicar filtros e ordenação
  useEffect(() => {
    let filteredServices = [...initialServices];

    // Aplicar filtro de busca
    if (searchTerm) {
      filteredServices = filteredServices.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.price.toString().includes(searchTerm)
      );
    }

    // Aplicar filtro de colaborador
    if (collaboratorFilter && collaboratorFilter !== "all") {
      filteredServices = filteredServices.filter((service) => {
        // Verificar colaborador principal
        if (service.collaborator?.id === collaboratorFilter) {
          return true;
        }

        // Verificar colaboradores adicionais
        return service.serviceCollaborators?.some(
          (sc) => sc.collaborator?.id === collaboratorFilter
        );
      });
    }

    // Aplicar ordenação
    filteredServices.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = typeof valueB === "string" ? valueB.toLowerCase() : valueB;
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setServices(filteredServices);
  }, [
    initialServices,
    searchTerm,
    collaboratorFilter,
    sortField,
    sortDirection,
  ]);

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deleteService(id);

      if (result.success) {
        toast.success("Serviço excluído com sucesso");
        setDeletingService(null);
        router.refresh();
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
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    router.push(`/services?page=${page}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCollaborators = (service: ServiceFullData) => {
    const allCollaborators = [] as Collaborator[];

    // Adicionar o colaborador principal se existir
    if (service.collaborator) {
      allCollaborators.push(service.collaborator);
    }

    // Adicionar os colaboradores adicionais
    if (
      service.serviceCollaborators &&
      service.serviceCollaborators.length > 0
    ) {
      service.serviceCollaborators.forEach((sc) => {
        // Evitar duplicatas (caso o colaborador principal também esteja na lista de adicionais)
        if (!allCollaborators.some((c) => c.id === sc.collaborator.id)) {
          allCollaborators.push(sc.collaborator);
        }
      });
    }

    if (allCollaborators.length === 0) {
      return "Nenhum";
    }

    if (allCollaborators.length === 1) {
      return allCollaborators[0].name;
    }

    return (
      <div className="flex flex-wrap gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-pointer">
                <Users className="h-3 w-3 mr-1" />
                {allCollaborators.length} profissionais
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="text-xs">
                {allCollaborators.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const getStatusBadge = (service: ServiceFullData) => {
    // Exemplo: considerando que um serviço está ativo se tiver dias disponíveis
    const isActive = service.availableDays && service.availableDays.length > 0;

    return (
      <Badge variant={isActive ? "default" : "destructive"} className="ml-2">
        {isActive ? "Ativo" : "Inativo"}
      </Badge>
    );
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={collaboratorFilter}
            onValueChange={setCollaboratorFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {collaborators.map((collaborator) => (
                <SelectItem key={collaborator.id} value={collaborator.id}>
                  {collaborator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Scissors className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name" label="Nome" />
              <SortableHeader field="durationMinutes" label="Tempo" />
              <SortableHeader field="price" label="Preço" />
              <SortableHeader field="commission" label="Comissão" />
              <TableHead>Dias Disponíveis</TableHead>
              <TableHead>Profissionais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="font-medium">
                    {service.durationMinutes} Min
                  </TableCell>
                  <TableCell>{formatCurrency(service.price)}</TableCell>
                  <TableCell>{service.commission}%</TableCell>
                  <TableCell>
                    {formatAvailableDays(service.availableDays)}
                  </TableCell>
                  <TableCell>{formatCollaborators(service)}</TableCell>
                  <TableCell>{getStatusBadge(service)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingService(service)}
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
        {services.length === 0 ? (
          <div className="text-center py-10 rounded-lg border p-4">
            Nenhum serviço encontrado.
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <h3 className="font-medium">{service.name}</h3>
                    {getStatusBadge(service)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.collaborator?.name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeletingService(service)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Duração:</span>
                  <p>{service.durationMinutes} Min</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço:</span>
                  <p>{formatCurrency(service.price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Comissão</span>
                  <p>{service.commission}%</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">
                    Dias Disponíveis:
                  </span>
                  <p>{formatAvailableDays(service.availableDays)}</p>
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

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={editingService}
        collaborators={collaborators}
      />

      {deletingService && (
        <DeleteServiceModal
          isOpen={!!deletingService}
          onClose={() => setDeletingService(null)}
          onConfirm={() => handleDelete(deletingService.id)}
          serviceName={deletingService.name}
          isLoading={isLoading}
        />
      )}

      {/* Diálogo de confirmação para ações */}
      <AlertDialog
        open={confirmAction.show}
        onOpenChange={(open) =>
          !open && setConfirmAction({ ...confirmAction, show: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.message}
            </AlertDialogDescription>
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
