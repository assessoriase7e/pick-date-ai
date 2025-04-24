"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

// Importar as server actions
import { savePrompt } from "@/actions/agents/save-prompt";
import { saveRedisKey } from "@/actions/agents/save-redis-key";
import { saveWhatsapp } from "@/actions/agents/save-whatsapp";
import { createEvolution } from "@/actions/agents/create-evolution";
// Adicionar importação para getPrompts
import { getPrompts } from "@/actions/agents/prompts";

// Adicionar importações para as funções de obtenção de dados
import { getRedisKey } from "@/actions/agents/redis-key";
import { getWhatsapp } from "@/actions/agents/whatsapp";

export function AgentPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Prompts section state
  const [attendantPrompt, setAttendantPrompt] = useState("");
  const [attendantEnabled, setAttendantEnabled] = useState(false);

  // RAG Files section state
  const [ragFiles, setRagFiles] = useState<
    { id: string; name: string; content: string }[]
  >([]);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  // Redis Key section state
  const [redisKey, setRedisKey] = useState("");

  // Whatsapp section state
  const [whatsappPhone, setWhatsappPhone] = useState("");

  // Evolution section state
  const [webhookUrl, setWebhookUrl] = useState("");

  // Adicionar useEffect para carregar os prompts existentes - MOVIDO PARA ANTES DO RETURN
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        // Carregar prompts
        const promptsResult = await getPrompts(user.id);
        if (promptsResult.success && promptsResult.data?.prompts) {
          const { prompts } = promptsResult.data;
          prompts.forEach((prompt) => {
            if (prompt.type === "Atendente") {
              setAttendantPrompt(prompt.content);
              setAttendantEnabled(prompt.isActive);
            }
          });
        }

        // Carregar chave Redis
        const redisKeyResult = await getRedisKey(user.id);
        if (redisKeyResult.success && redisKeyResult.data?.redisKey) {
          setRedisKey(redisKeyResult.data.redisKey.key);
        }

        // Carregar número do WhatsApp
        const whatsappResult = await getWhatsapp(user.id);
        if (whatsappResult.success && whatsappResult.data?.whatsapp) {
          setWhatsappPhone(whatsappResult.data.whatsapp.phoneNumber);
        }

        // Carregar arquivos RAG e outras configurações conforme necessário
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    loadData();
  }, [user?.id]);

  // Handle saving prompt
  const handleSavePrompt = async () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await savePrompt({
        userId: user.id,
        type: "Atendente",
        content: attendantPrompt,
        isActive: attendantEnabled,
      });

      if (result.success) {
        toast.success("Prompt salvo com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar prompt");
      }
    } catch (error) {
      console.error("Erro ao salvar prompt:", error);
      toast.error("Ocorreu um erro ao salvar o prompt");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new RAG file
  const handleAddRagFile = () => {
    if (!newFileName || !newFileContent) {
      toast.error("Nome e conteúdo do arquivo são obrigatórios");
      return;
    }

    const newFile = {
      id: Date.now().toString(),
      name: newFileName,
      content: newFileContent,
    };

    setRagFiles([...ragFiles, newFile]);
    setNewFileName("");
    setNewFileContent("");
    toast.success("Arquivo adicionado com sucesso!");
  };

  // Handle removing a RAG file
  const handleRemoveRagFile = (id: string) => {
    setRagFiles(ragFiles.filter((file) => file.id !== id));
    toast.success("Arquivo removido com sucesso!");
  };

  // Handle viewing a RAG file
  const handleViewRagFile = (content: string) => {
    setSelectedFileContent(content);
    setIsFileDialogOpen(true);
  };

  // Handle saving Redis key
  const handleSaveRedisKey = async () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveRedisKey({
        userId: user.id,
        key: redisKey,
      });

      if (result.success) {
        toast.success("Chave Redis salva com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar chave Redis");
      }
    } catch (error) {
      console.error("Erro ao salvar chave Redis:", error);
      toast.error("Ocorreu um erro ao salvar a chave Redis");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving Whatsapp phone
  const handleSaveWhatsappPhone = async () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveWhatsapp({
        userId: user.id,
        phoneNumber: whatsappPhone,
      });

      if (result.success) {
        toast.success("Telefone Whatsapp salvo com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar número do Whatsapp");
      }
    } catch (error) {
      console.error("Erro ao salvar Whatsapp:", error);
      toast.error("Ocorreu um erro ao salvar o número do Whatsapp");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new Evolution instance
  const handleCreateEvolutionInstance = async () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createEvolution({
        userId: user.id,
        webhookUrl,
      });

      if (result.success) {
        toast.success("Nova instância criada com sucesso!");
      } else {
        toast.error(result.error || "Erro ao criar nova instância");
      }
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      toast.error("Ocorreu um erro ao criar a nova instância");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-8">Agentes</h1>

      {/* Prompts Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prompts</h2>
        <Tabs defaultValue="atendente">
          <TabsList>
            <TabsTrigger value="atendente">Atendente</TabsTrigger>
            <TabsTrigger value="sdr" disabled>
              SDR
            </TabsTrigger>
            <TabsTrigger value="followup" disabled>
              Follow Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="atendente" className="mt-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Atendente"
                className="min-h-[200px]"
                value={attendantPrompt}
                onChange={(e) => setAttendantPrompt(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="attendant-active"
                    checked={attendantEnabled}
                    onCheckedChange={setAttendantEnabled}
                  />
                  <Label htmlFor="attendant-active">Ativar</Label>
                </div>
                <Button onClick={handleSavePrompt} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator className="my-8" />

      {/* RAG Files Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Arquivos RAG</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nome do arquivo"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
            <Button onClick={handleAddRagFile}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
          <Textarea
            placeholder="Conteúdo do arquivo"
            className="min-h-[150px]"
            value={newFileContent}
            onChange={(e) => setNewFileContent(e.target.value)}
          />

          {ragFiles.length > 0 && (
            <div className="border rounded-md mt-4">
              <div className="p-4 font-medium border-b">Arquivos</div>
              <div className="divide-y">
                {ragFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div
                      className="flex-1 cursor-pointer hover:underline"
                      onClick={() => handleViewRagFile(file.content)}
                    >
                      {file.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRagFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conteúdo do Arquivo</DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
                  {selectedFileContent}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-10">
        {/* Redis Key Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Chave Redis</h2>
          <Input
            placeholder="Chave Redis"
            value={redisKey}
            onChange={(e) => setRedisKey(e.target.value)}
          />
          <Button
            onClick={handleSaveRedisKey}
            className="mt-2 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Whatsapp Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Whatsapp</h2>
          <Input
            placeholder="Número do Whatsapp"
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
          />
          <Button
            onClick={handleSaveWhatsappPhone}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Evolution Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Evolution</h2>
          <div className="space-y-4">
            <Input
              placeholder="URL do Webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Button
              onClick={handleCreateEvolutionInstance}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Criando..." : "Criar Nova Instância"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
