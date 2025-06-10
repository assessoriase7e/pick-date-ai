"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Users } from "lucide-react";
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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Client } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../ui/input";

interface ClientsTableProps {
  clients: Client[];
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
}

export default function ClientsTable({
  clients,
  pagination = { totalPages: 1, currentPage: 1 },
}: ClientsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneTerm, setPhoneTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedPhoneTerm = useDebounce(phoneTerm, 500);

  useEffect(() => {
    const search = searchParams.get("search");
    const phone = searchParams.get("phone");
    if (search) {
      setSearchTerm(search);
    }
    if (phone) {
      setPhoneTerm(phone);
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedSearchTerm !== undefined || debouncedPhoneTerm !== undefined) {
      const params = new URLSearchParams(searchParams.toString());

      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      } else {
        params.delete("search");
      }

      if (debouncedPhoneTerm) {
        params.set("phone", debouncedPhoneTerm);
      } else {
        params.delete("phone");
      }

      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, debouncedPhoneTerm]);

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
    setIsEditClientDialogOpen(false);
    router.refresh();
  };

  // Função para navegar entre páginas
  const navigateToPage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    const newUrl = `${pathname}?${params.toString()}`;

    // Usar replace em vez de push para evitar problemas de navegação
    router.push(newUrl, { scroll: false });
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "fullName",
      header: "Nome",
    },
    {
      accessorKey: "phone",
      header: "Telefone",
    },
    {
      accessorKey: "birthDate",
      header: "Data de Nascimento",
      cell: ({ row }) => {
        const date = row.original.birthDate;
        return date ? formatDate(date) : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex space-x-2">
            <Link href={`/clients/${client.id}/services`}>
              <Button variant="outline" size="icon">
                <FileText className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditClick(client)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteClick(client.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const headerContent = (
    <Button
      onClick={() => setIsNewClientDialogOpen(true)}
      className="w-full lg:max-w-xs"
    >
      <Users className="mr-2 h-4 w-4" />
      Novo Cliente
    </Button>
  );

  // Função para executar busca manual
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    if (phoneTerm) {
      params.set("phone", phoneTerm);
    } else {
      params.delete("phone");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* Campos de busca personalizados */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-2 mb-4 w-full">
        <div className="flex flex-col lg:flex-row gap-2 w-full">
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lg:max-w-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Input
            placeholder="Buscar por telefone..."
            value={phoneTerm}
            onChange={(e) => setPhoneTerm(e.target.value)}
            className="lg:max-w-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        {headerContent}
      </div>

      <DataTable
        columns={columns}
        data={clients}
        sortableColumns={["fullName", "phone", "birthDate"]}
        headerContent={null}
        enableSearch={true}
        searchPlaceholder="Buscar clientes..."
        pagination={pagination}
        onSearch={(value) => {
          setSearchTerm(value);
        }}
      />

      <Dialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
      >
        <DialogContent className="w-full lg:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm onSuccess={handleClientFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditClientDialogOpen}
        onOpenChange={setIsEditClientDialogOpen}
      >
        <DialogContent className="w-full lg::max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            initialData={clientToEdit}
            onSuccess={handleClientFormSuccess}
          />
        </DialogContent>
      </Dialog>

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
