import { toast } from "sonner";
import { savePrompt } from "@/actions/agents/save-prompt";

export const usePromptHandlers = (setIsLoading: (loading: boolean) => void) => {
  const handleSavePrompt = async (
    userId: string | undefined,
    attendantPrompt: string,
    attendantEnabled: boolean
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await savePrompt({
        userId,
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

  return { handleSavePrompt };
};