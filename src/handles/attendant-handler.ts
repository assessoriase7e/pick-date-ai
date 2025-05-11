import { toast } from "sonner";
import { saveAttendantPrompt } from "@/actions/agents/attendant/save-attendant-prompt";

export const useAttendantHandler = () => {
  const handleSaveAttendantPrompt = async (
    userId: string | undefined,
    content: string,
    isActive: boolean,
    presentation: string,
    speechStyle: string,
    expressionInterpretation: string,
    schedulingScript: string,
    rules: string,
    suportPhone: string
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const result = await saveAttendantPrompt({
        userId,
        content,
        isActive,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules,
        suportPhone,
      });

      if (result.success) {
        toast.success("Prompt do atendente salvo com sucesso");
      } else {
        toast.error(result.error || "Erro ao salvar prompt");
      }

      return result;
    } catch (error) {
      console.error("Erro ao salvar prompt:", error);
      toast.error("Ocorreu um erro ao salvar o prompt");
      throw error;
    }
  };

  return { handleSaveAttendantPrompt };
};
