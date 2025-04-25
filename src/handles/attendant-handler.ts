import { savePrompt } from "@/actions/agents/prompts";
import { toast } from "sonner";

export function useAttendantHandler() {
  const handleSaveAttendantPrompt = async (
    userId?: string,
    content?: string,
    isActive?: boolean,
    presentation?: string,
    speechStyle?: string,
    expressionInterpretation?: string,
    schedulingScript?: string,
    rules?: string
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const result = await savePrompt({
        userId,
        type: "Atendente",
        content: content || "",
        isActive: isActive || false,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules,
      });

      if (result.success) {
        toast.success("Prompt de atendente salvo com sucesso");
      } else {
        toast.error(result.error || "Erro ao salvar prompt");
      }

      return result;
    } catch (error) {
      console.error("Erro ao salvar prompt do atendente:", error);
      toast.error("Ocorreu um erro ao salvar o prompt");
      throw error;
    }
  };

  return { handleSaveAttendantPrompt };
}
