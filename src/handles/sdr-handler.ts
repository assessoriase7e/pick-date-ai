import { toast } from "sonner";
import { savePrompt } from "@/actions/agents/prompts";

export const useSdrHandler = () => {
  const handleSaveSdrPrompt = async (
    userId: string | undefined,
    sdrPrompt: string,
    isSdrActive: boolean
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const result = await savePrompt({
        userId,
        type: "SDR",
        content: sdrPrompt,
        isActive: isSdrActive,
      });

      if (result.success) {
        toast.success("Prompt de SDR salvo com sucesso");
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

  return { handleSaveSdrPrompt };
};
