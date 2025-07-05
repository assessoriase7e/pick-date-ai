"use client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Users, Phone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { deleteClient } from "@/actions/clients/delete-client";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import ClientForm from "./client-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Client } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { saveClient } from "@/actions/clients/save-client";
import { ClientFormValues } from "@/validators/client";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneTerm, setPhoneTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

            <Button variant="outline" size="icon" onClick={() => handleEditClick(client)}>
              <Edit className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => handleDeleteClick(client.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const headerContent = (
    <Button onClick={() => setIsNewClientDialogOpen(true)} className="w-full lg:max-w-xs">
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
      <div className="flex flex-col lg:flex-row items-center justify-between gap-2 w-full">
        <div className="flex flex-col lg:flex-row gap-2 w-full">
          <div className="flex">
            <div className="h-9 w-14 flex items-center justify-center border rounded-md rounded-r-none">
              <FileText className="h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:max-w-sm rounded-l-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <div className="flex">
            <div className="h-9 w-14 flex items-center justify-center border rounded-md rounded-r-none">
              <Phone className="h-4 w-4" />
            </div>

            <Input
              placeholder="Buscar por telefone..."
              value={phoneTerm}
              onChange={(e) => setPhoneTerm(e.target.value)}
              className="lg:max-w-sm rounded-l-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
        </div>
        {headerContent}
      </div>

      <DataTable
        columns={columns}
        data={clients}
        sortableColumns={["fullName", "phone", "birthDate"]}
        headerContent={null}
        enableSearch={false}
        pagination={pagination}
        onSearch={(value) => {
          setSearchTerm(value);
        }}
      />

      <ConfirmationDialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
        title="Novo Cliente"
        confirmText="Salvar"
        cancelText="Cancelar"
        onConfirm={() => {}}
      >
        <ClientForm 
          onSubmit={handleSaveClient} 
          onCancel={() => setIsNewClientDialogOpen(false)}
          isSaving={isSaving}
        />
      </ConfirmationDialog>

      <ConfirmationDialog
        open={isEditClientDialogOpen}
        onOpenChange={setIsEditClientDialogOpen}
        title="Editar Cliente"
        confirmText="Salvar"
        cancelText="Cancelar"
        size="lg"
        onConfirm={() => {}}
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
