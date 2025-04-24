"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { savePrompt, getPrompts } from "@/actions/agents/prompts";
import { Prompt } from "@prisma/client";

export function PromptsSection() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [attendantPrompt, setAttendantPrompt] = useState("");
  const [isAttendantActive, setIsAttendantActive] = useState(false);
  const [sdrPrompt, setSdrPrompt] = useState("");
  const [isSdrActive, setIsSdrActive] = useState(false);
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [isFollowUpActive, setIsFollowUpActive] = useState(false);

  useEffect(() => {
    async function loadPrompts() {
      if (!user?.id) return;

      try {
        const result = await getPrompts(user.id);
        if (result.success && result.data?.prompts) {
          const { prompts } = result.data;

          // Mapeamento de tipos para funções de estado
          const promptSetters: Record<
            string,
            {
              setContent: (content: string) => void;
              setActive: (active: boolean) => void;
            }
          > = {
            "Atendente": {
              setContent: setAttendantPrompt,
              setActive: setIsAttendantActive,
            },
            "SDR": {
              setContent: setSdrPrompt,
              setActive: setIsSdrActive,
            },
            "Follow Up": {
              setContent: setFollowUpPrompt,
              setActive: setIsFollowUpActive,
            },
          };

          // Configurar os prompts existentes
          prompts.forEach((prompt: Prompt) => {
            const setter = promptSetters[prompt.type];
            if (setter) {
              setter.setContent(prompt.content);
              setter.setActive(prompt.isActive);
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar prompts:", error);
      }
    }

    loadPrompts();
  }, [user?.id]);

  const handleSaveAttendantPrompt = async () => {
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
        isActive: isAttendantActive,
      });

      if (result.success) {
        toast.success("Prompt de atendente salvo com sucesso");
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Prompts</h2>

      <Tabs defaultValue="attendant" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendant">Atendente</TabsTrigger>
          <TabsTrigger value="sdr" disabled>
            SDR
          </TabsTrigger>
          <TabsTrigger value="followup" disabled>
            Follow Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendant" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="attendant-active"
                checked={isAttendantActive}
                onCheckedChange={setIsAttendantActive}
              />
              <Label htmlFor="attendant-active">Ativar</Label>
            </div>
          </div>

          <Textarea
            placeholder="Digite o prompt para o atendente..."
            className="min-h-[200px]"
            value={attendantPrompt}
            onChange={(e) => setAttendantPrompt(e.target.value)}
          />

          <div className="flex justify-end">
            <Button onClick={handleSaveAttendantPrompt} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sdr" className="space-y-4 mt-4">
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento.
          </p>
        </TabsContent>

        <TabsContent value="followup" className="space-y-4 mt-4">
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
