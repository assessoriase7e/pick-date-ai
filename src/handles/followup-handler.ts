import { toast } from "sonner";
import { saveFollowUpPrompt } from "@/actions/agents/followup/save-followup-prompt";

export const useFollowUpHandler = () => {
  const handleSaveFollowUpPrompt = async (
    userId: string | undefined,
    followUpPrompt: string,
    isFollowUpActive: boolean
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const result = await saveFollowUpPrompt({
        userId,
        content: followUpPrompt,
        isActive: isFollowUpActive,
      });

      if (result.success) {
        toast.success("Prompt de Follow Up salvo com sucesso");
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

  return { handleSaveFollowUpPrompt };
};
