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
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  fullName: string;
  phone: string;
  birthDate: Date;
}

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

  // Efeito para detectar cliques no botão "Novo Cliente" da página principal
  useEffect(() => {
    const newClientButton = document.querySelector(".new-client-button");
    if (newClientButton) {
      newClientButton.addEventListener("click", () => {
        setIsNewClientDialogOpen(true);
      });
    }

    return () => {
      if (newClientButton) {
        newClientButton.removeEventListener("click", () => {
          setIsNewClientDialogOpen(true);
        });
      }
    };
  }, []);

  const handleClientFormSuccess = () => {
    setIsNewClientDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsNewClientDialogOpen(true)}>
          <Users className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de Nascimento</TableHead>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para novo cliente */}
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
