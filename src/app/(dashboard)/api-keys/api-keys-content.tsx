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
import { ApiKey } from "@prisma/client";
import { toast } from "sonner";
import { createApiKey } from "@/actions/api-key/create";
import { updateApiKey } from "@/actions/api-key/update";
import { deleteApiKey } from "@/actions/api-key/delete";
import { revalidatePathAction } from "@/actions/revalidate-path";

interface ApiKeyWithKey extends ApiKey {
  key: string;
}

interface ApiKeysContentProps {
  apiKeys: ApiKey[];
  totalPages: number;
  currentPage: number;
}

export function ApiKeysContent({
  apiKeys,
  totalPages,
  currentPage,
}: ApiKeysContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [deletingApiKey, setDeletingApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null
  );
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  async function handleCreateApiKey(data: { description?: string }) {
    try {
      setLoading(true);
      const result = await createApiKey(data);

      setNewlyGeneratedKey(result?.data!.key);

      revalidatePathAction("/api-keys");
    } catch (error) {
      console.error("Erro ao criar chave:", error);
      toast("Erro ao criar chave");
    } finally {
      setLoading(false);
      setIsCreateModalOpen(false);
    }
  }

  async function handleUpdateApiKey(data: { description?: string }) {
    if (!editingApiKey) return;
    try {
      setLoading(true);
      const result = await updateApiKey(editingApiKey.id, data);

      if (result.success) {
        router.refresh();
        toast("Chave de API atualizada com sucesso!");
      } else {
        toast("Erro ao atualizar chave");
      }
    } catch (error) {
      console.error("Erro ao atualizar chave:", error);
      toast("Erro ao atualizar chave");
    } finally {
      setLoading(false);
      setEditingApiKey(null);
    }
  }

  async function handleDeleteApiKey() {
    if (!deletingApiKey) return;
    try {
      setLoading(true);
      const result = await deleteApiKey(deletingApiKey.id);

      if (result.success) {
        router.refresh();
        toast("Chave de API excluída com sucesso!");
      } else {
        toast("Erro ao excluir chave");
      }
    } catch (error) {
      console.error("Erro ao excluir chave:", error);
      toast("Erro ao excluir chave");
    } finally {
      setLoading(false);
      setDeletingApiKey(null);
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

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block">
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
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!loading && apiKeys?.length === 0 && (
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

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : apiKeys?.length === 0 ? (
          <div className="text-center py-10">
            Nenhuma chave de API encontrada.
          </div>
        ) : (
          apiKeys?.map((apiKey) => (
            <div key={apiKey.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{apiKey.description || "-"}</p>
                  <div className="flex items-center gap-2">
                    {showKeyId === apiKey.id ? (
                      <>
                        <code className="font-mono text-sm">{apiKey.key}</code>
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
                        <code className="font-mono text-sm">
                          {apiKey.key.substring(0, 7)}...
                        </code>
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
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(apiKey.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingApiKey(apiKey)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeletingApiKey(apiKey)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            router.push(`/api-keys?page=${newPage}`);
          }}
          isLoading={loading}
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
