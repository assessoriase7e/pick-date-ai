import { toast } from "sonner";
import { savePrompt } from "@/actions/agents/prompts";

export const useAttendantHandler = () => {
  const handleSaveAttendantPrompt = async (
    userId: string | undefined,
    attendantPrompt: string,
    isAttendantActive: boolean
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const result = await savePrompt({
        userId,
        type: "Atendente",
        content: attendantPrompt,
        isActive: isAttendantActive,
      });

      if (result.success) {
        toast.success("Prompt de atendente salvo com sucesso");
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
