import { toast } from "sonner";
import { savePrompt } from "@/actions/agents/prompts";

export const usePromptHandlers = (setIsLoading: (loading: boolean) => void) => {
  const handleSavePrompt = async (
    userId: string | undefined,
    type: string,
    content: string,
    isActive: boolean
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await savePrompt({
        userId,
        type,
        content,
        isActive,
      });

      if (result.success) {
        toast.success(`Prompt de ${type.toLowerCase()} salvo com sucesso`);
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

  return { handleSavePrompt };
};
