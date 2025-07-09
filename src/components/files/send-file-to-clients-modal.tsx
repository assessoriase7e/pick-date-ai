"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileRecord, Client } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { sendFileToClients } from "@/actions/files/send-to-clients";
import { Loader2 } from "lucide-react";

interface SendFileToClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileRecord[];
  initialClients: Client[];
  totalPages: number;
  onSearch: (term: string, page: number) => Promise<{
    clients: Client[];
    totalPages: number;
  }>;
}

export function SendFileToClientsModal({ 
  isOpen, 
  onClose, 
  files, 
  initialClients, 
  totalPages: initialTotalPages,
  onSearch 
}: SendFileToClientsModalProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const handleSearch = async (term: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await onSearch(term, pageNum);
      setClients(result.clients);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1); // Reset para a primeira página ao buscar
    handleSearch(term, 1);
  };

  const handleClientSelection = (clientId: number) => {
    setSelectedClientIds((prev) => {
      if (prev.includes(clientId)) {
        return prev.filter((id) => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedClientIds.length === clients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(clients.map((client) => client.id));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSearch(searchTerm, newPage);
  };

  const handleSendFiles = async () => {
    if (selectedClientIds.length === 0) {
      toast.error("Selecione pelo menos um cliente");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendFileToClients({
        fileIds: files.map((file) => file.id),
        clientIds: selectedClientIds,
      });

      if (result.success) {
        toast.success(`Arquivos enviados com sucesso para ${result.sentCount} clientes`);
        onClose();
      } else {
        toast.error(result.error || "Erro ao enviar arquivos");
      }
    } catch (error) {
      console.error("Erro ao enviar arquivos:", error);
      toast.error("Ocorreu um erro ao enviar os arquivos");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar arquivos para clientes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p>Arquivos selecionados: {files.length}</p>
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
          </div>

          <div className="border rounded-md">
            <div className="flex items-center p-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedClientIds.length > 0 && selectedClientIds.length === clients.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="ml-2 font-medium">
                Selecionar todos
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <div key={client.id} className="flex items-center p-2 hover:bg-muted">
                    <Checkbox
                      id={`client-${client.id}`}
                      checked={selectedClientIds.includes(client.id)}
                      onCheckedChange={() => handleClientSelection(client.id)}
                    />
                    <label htmlFor={`client-${client.id}`} className="ml-2 flex-1 cursor-pointer">
                      <div>{client.fullName}</div>
                      <div className="text-sm text-muted-foreground">{client.phone}</div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">Nenhum cliente encontrado</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={handleSendFiles} disabled={isSending || selectedClientIds.length === 0}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Enviar para {selectedClientIds.length} clientes</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
