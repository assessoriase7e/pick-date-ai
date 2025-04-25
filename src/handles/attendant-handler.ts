import { savePrompt } from "@/actions/agents/prompts";
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
      await savePrompt({
        userId,
        type: "Atendente",
        content,
        isActive,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules,
        formattedContent,
      });

      toast.success("Prompt do atendente salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar prompt do atendente:", error);
      toast.error("Erro ao salvar prompt do atendente");
    }
  };

  return { handleSaveAttendantPrompt };
}
