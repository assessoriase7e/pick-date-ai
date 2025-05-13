"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  FileText,
  Users,
  Search,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { deleteClient } from "@/actions/clients/delete-client";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientForm from "./client-form";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import IsTableLoading from "../isTableLoading";
import { useDebounce } from "@/hooks/use-debounce";
import { revalidatePathAction } from "@/actions/revalidate-path";

interface Client {
  id: string;
  fullName: string;
  phone: string;
  birthDate: Date;
}

type SortField = "fullName" | "phone" | "birthDate";
type SortDirection = "asc" | "desc";

interface ClientsTableProps {
  clients: Client[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  initialFilters?: {
    searchTerm: string;
    sortField: SortField;
    sortDirection: SortDirection;
  };
}

export default function ClientsTable({
  clients,
  pagination: initialPagination,
  initialFilters,
}: ClientsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    initialFilters?.searchTerm || ""
  );
  const [sortField, setSortField] = useState<SortField>(
    initialFilters?.sortField || "fullName"
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
      sortField === initialFilters?.sortField &&
      sortDirection === initialFilters?.sortDirection
    ) {
      return;
    }

    updateUrl(1);
  }, [debouncedSearchTerm, sortField, sortDirection]);

  const updateUrl = (page: number) => {
    const params = new URLSearchParams();

    if (page !== 1) {
      params.set("page", String(page));
    }

    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    }

    if (sortField !== "fullName") {
      params.set("sortField", sortField);
    }

    if (sortDirection !== "asc") {
      params.set("sortDirection", sortDirection);
    }

    const query = params.toString();
    const url = `${pathname}${query ? `?${query}` : ""}`;

    setIsPageChanging(true);
    revalidatePathAction("/clients");
    router.push(url);
  };

  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
    console.log(id);

    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log(clientToDelete);
    if (!clientToDelete) return;

    setIsDeleting(true);
    const result = await deleteClient(clientToDelete);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (result.success) {
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
      router.refresh();
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir cliente",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleClientFormSuccess = () => {
    setIsNewClientDialogOpen(false);
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    updateUrl(page);
  };

  // Efeito para detectar quando a página foi totalmente carregada
  useEffect(() => {
    if (isPageChanging) {
      setIsPageChanging(false);
    }
  }, [clients]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
    <>
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setIsNewClientDialogOpen(true)}>
          <Users className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block relative mt-4">
        <IsTableLoading isPageChanging={isPageChanging} />
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="fullName" label="Nome" />
              <SortableHeader field="phone" label="Telefone" />
              <SortableHeader field="birthDate" label="Data de Nascimento" />
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.fullName}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{formatDate(client.birthDate)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/clients/${client.id}/services`}>
                        <Button variant="outline" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Link href={`/clients/${client.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(client.id)}
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
      <div className="md:hidden space-y-4 mt-4">
        {clients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">
            Nenhum cliente encontrado
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{client.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {client.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(client.birthDate)}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link href={`/clients/${client.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/clients/${client.id}/services`}>
                    <Button variant="outline" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteClick(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação */}

      <div className="flex items-center justify-center py-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modais existentes */}
      <Dialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm onSuccess={handleClientFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
