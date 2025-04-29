"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiKeyModal } from "./api-key-modal";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Trash2, EyeOff, Copy, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { ApiKey } from "@prisma/client"; // Importe o tipo ApiKey
import { useApiKeys } from "@/hooks/use-api-keys";
import { toast } from "sonner";

// Interface para o tipo de dado retornado pelo hook/API, incluindo a chave na criação
interface ApiKeyWithKey extends ApiKey {
  key: string;
}

export function ApiKeysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { apiKeys, totalPages, isLoading, mutate } = useApiKeys(page);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [deletingApiKey, setDeletingApiKey] = useState<ApiKey | null>(null);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null
  );
  const [showKeyId, setShowKeyId] = useState<string | null>(null); // Para mostrar/esconder a chave

  async function handleCreateApiKey(data: { description?: string }) {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar chave de API");
      }

      const newKeyData: ApiKeyWithKey = await response.json();
      setNewlyGeneratedKey(newKeyData.key); // Armazena a chave gerada para mostrar uma vez
      mutate(); // Revalida os dados
      setIsCreateModalOpen(false);
      toast("Chave de API criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar chave:", error);
      toast("Erro ao criar chave");
    }
  }

  async function handleUpdateApiKey(data: { description?: string }) {
    if (!editingApiKey) return;
    try {
      const response = await fetch(`/api/api-keys/${editingApiKey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar chave de API");
      }

      mutate();
      setEditingApiKey(null);
      toast("Chave de API atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar chave:", error);
      toast("Erro ao atualizar chave");
    }
  }

  async function handleDeleteApiKey() {
    if (!deletingApiKey) return;
    try {
      const response = await fetch(`/api/api-keys/${deletingApiKey.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir chave de API");
      }

      mutate();
      setDeletingApiKey(null);
      toast("Chave de API excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir chave:", error);
      toast("Erro ao excluir chave");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Chave copiada para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar:", err);
        toast("Erro ao copiar chave");
      });
  }

  // Limpa a chave recém-gerada quando o modal de alerta é fechado
  function handleAlertClose() {
    setNewlyGeneratedKey(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chaves de API</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Chave
        </Button>
      </div>

      {/* Alerta para mostrar a chave recém-criada */}
      {newlyGeneratedKey && (
        <AlertDialog open={!!newlyGeneratedKey} onOpenChange={handleAlertClose}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chave de API Criada!</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  Sua nova chave de API foi gerada. Copie-a e guarde-a em um
                  local seguro.
                  <strong className="block my-2">
                    Você não poderá vê-la novamente.
                  </strong>
                  <div className="flex items-center gap-2 mt-2 p-2 border rounded bg-muted">
                    <code className="flex-grow break-all">
                      {newlyGeneratedKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(newlyGeneratedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleAlertClose}>
                Entendido
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Chave (Início)</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && apiKeys?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhuma chave de API encontrada.
                </TableCell>
              </TableRow>
            )}
            {apiKeys?.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>{apiKey.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {showKeyId === apiKey.id ? (
                      <>
                        <code className="font-mono">{apiKey.key}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowKeyId(null)}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <code className="font-mono">
                          {apiKey.key.substring(0, 7)}...
                        </code>
                        {/* Não mostramos a chave completa por padrão */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowKeyId(apiKey.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(apiKey.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingApiKey(apiKey)}
                      title="Editar Descrição"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeletingApiKey(apiKey)}
                      title="Excluir Chave"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            router.push(`/api-keys?page=${newPage}`);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Modal para Criar */}
      <ApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateApiKey}
        title="Criar Nova Chave de API"
      />

      {/* Modal para Editar */}
      {editingApiKey && (
        <ApiKeyModal
          isOpen={!!editingApiKey}
          onClose={() => setEditingApiKey(null)}
          onSubmit={handleUpdateApiKey}
          initialData={editingApiKey}
          title="Editar Descrição da Chave"
        />
      )}

      {/* Confirmação para Deletar */}
      {deletingApiKey && (
        <AlertDialog
          open={!!deletingApiKey}
          onOpenChange={() => setDeletingApiKey(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a
                chave de API{" "}
                <code className="font-mono bg-muted p-1 rounded">
                  {deletingApiKey.key.substring(0, 7)}...
                </code>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteApiKey}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
