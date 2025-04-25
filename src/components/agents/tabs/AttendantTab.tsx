import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAttendantHandler } from "@/handles/attendant-handler";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getPrompts } from "@/actions/agents/prompts";
import { AttendantPrompt } from "@/types/prompt";

interface AttendantTabProps {
  onSave?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading?: (value: boolean) => void;
}

export function AttendantTab({
  onSave,
  isLoading,
  setIsLoading,
}: AttendantTabProps) {
  const { user } = useUser();
  const { handleSaveAttendantPrompt } = useAttendantHandler();
  const [isActive, setIsActive] = useState(false);

  // Novos estados para os campos do formulário
  const [presentation, setPresentation] = useState("");
  const [speechStyle, setSpeechStyle] = useState("");
  const [expressionInterpretation, setExpressionInterpretation] = useState("");
  const [schedulingScript, setSchedulingScript] = useState("");
  const [rules, setRules] = useState("");

  useEffect(() => {
    async function loadAttendantPrompt() {
      if (!user?.id) return;

      try {
        const result = await getPrompts(user.id);
        if (result.success && result.data?.prompts) {
          const { prompts } = result.data;

          const attendantPrompt = prompts.find(
            (prompt) => prompt.type === "Atendente"
          ) as AttendantPrompt | undefined;

          if (attendantPrompt) {
            setIsActive(attendantPrompt.isActive);

            setPresentation((attendantPrompt as any).presentation || "");
            setSpeechStyle((attendantPrompt as any).speechStyle || "");
            setExpressionInterpretation(
              (attendantPrompt as any).expressionInterpretation || ""
            );
            setSchedulingScript(
              (attendantPrompt as any).schedulingScript || ""
            );
            setRules((attendantPrompt as any).rules || "");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar prompt do atendente:", error);
      }
    }

    loadAttendantPrompt();
  }, [user?.id]);

  const handleSave = async () => {
    if (onSave) {
      return onSave();
    }

    if (setIsLoading) setIsLoading(true);
    try {
      const content = `Apresentação: ${presentation}\n\nEstilo da Fala: ${speechStyle}\n\nInterpretação de Expressões: ${expressionInterpretation}\n\nScript de Agendamento: ${schedulingScript}\n\nRegras: ${rules}`;

      await handleSaveAttendantPrompt(
        user?.id,
        content,
        isActive,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules
      );
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="attendant-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="attendant-active">Ativar</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="presentation">Apresentação</Label>
          <Textarea
            id="presentation"
            placeholder="Digite a apresentação do atendente..."
            className="min-h-[100px] mt-2"
            value={presentation}
            onChange={(e) => setPresentation(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="speechStyle">Estilo da Fala</Label>
          <Textarea
            id="speechStyle"
            placeholder="Descreva o estilo de fala do atendente..."
            className="min-h-[100px] mt-2"
            value={speechStyle}
            onChange={(e) => setSpeechStyle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="expressionInterpretation">
            Interpretação de Expressões
          </Label>
          <Textarea
            id="expressionInterpretation"
            placeholder="Como o atendente deve interpretar expressões..."
            className="min-h-[100px] mt-2"
            value={expressionInterpretation}
            onChange={(e) => setExpressionInterpretation(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="schedulingScript">Script de Agendamento</Label>
          <Textarea
            id="schedulingScript"
            placeholder="Script para agendamento..."
            className="min-h-[100px] mt-2"
            value={schedulingScript}
            onChange={(e) => setSchedulingScript(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="rules">Regras</Label>
          <Textarea
            id="rules"
            placeholder="Regras para o atendente seguir..."
            className="min-h-[100px] mt-2"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
