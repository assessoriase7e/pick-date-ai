import { saveSdrPrompt } from "@/actions/agents/sdr/save-sdr-prompt";
import { toast } from "sonner";

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
      const result = await saveSdrPrompt({
        userId,
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
