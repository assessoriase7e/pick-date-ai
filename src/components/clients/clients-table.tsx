"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { Client } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface ClientsTableProps {
  clients: Client[];
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
    setIsDeleteDialogOpen(true);
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
        );
      },
    },
  ];

  const headerContent = (
    <Button onClick={() => setIsNewClientDialogOpen(true)}>
      <Users className="mr-2 h-4 w-4" />
      Novo Cliente
    </Button>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={clients}
        sortableColumns={["fullName", "phone", "birthDate"]}
        headerContent={headerContent}
        searchPlaceholder="Buscar clientes..."
        pageSize={10}
        enablePagination
      />

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
