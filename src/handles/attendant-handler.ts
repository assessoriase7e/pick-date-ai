import { saveAttendantPrompt } from "@/actions/agents/attendant/save-attendant-prompt";
import { toast } from "sonner";

export function useAttendantHandler() {
  const handleSaveAttendantPrompt = async (
    userId: string | undefined,
    content: string,
    isActive: boolean,
    presentation: string,
    speechStyle: string,
    expressionInterpretation: string,
    schedulingScript: string,
    rules: string
  ) => {
    if (!userId) return;

    try {
      // Criar o conteúdo formatado com hashtags
      const formattedContent =
        `#Apresentação\n${presentation}\n\n` +
        `#Estilo da Fala\n${speechStyle}\n\n` +
        `#Interpretação de Expressões\n${expressionInterpretation}\n\n` +
        `#Script de Agendamento\n${schedulingScript}\n\n` +
        `#Regras\n${rules}`;

      // Salvar o prompt com o conteúdo formatado
      const result = await saveAttendantPrompt({
        userId,
        content,
        isActive,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules,
        formattedContent,
      });

      if (result.success) {
        toast.success("Prompt do atendente salvo com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar prompt do atendente");
      }
    } catch (error) {
      console.error("Erro ao salvar prompt do atendente:", error);
      toast.error("Erro ao salvar prompt do atendente");
    }
  };

  return { handleSaveAttendantPrompt };
}
