import { toast } from "sonner";
import { saveRedisKey } from "@/actions/agents/save-redis-key";
import { saveWhatsapp } from "@/actions/agents/whatsapp/save-whatsapp";
import { createEvolution } from "@/actions/agents/create-evolution";

export const useConfigHandlers = (setIsLoading: (loading: boolean) => void) => {
  const handleSaveRedisKey = async (
    userId: string | undefined,
    redisKey: string
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveRedisKey({
        userId,
        key: redisKey,
      });

      if (result.success) {
        toast.success("Chave Redis salva com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar chave Redis");
      }
    } catch (error) {
      console.error("Erro ao salvar chave Redis:", error);
      toast.error("Ocorreu um erro ao salvar a chave Redis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWhatsappPhone = async (
    userId: string | undefined,
    whatsappPhone: string
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveWhatsapp({
        userId,
        phoneNumber: whatsappPhone,
      });

      if (result.success) {
        toast.success("Telefone Whatsapp salvo com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar número do Whatsapp");
      }
    } catch (error) {
      console.error("Erro ao salvar Whatsapp:", error);
      toast.error("Ocorreu um erro ao salvar o número do Whatsapp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvolutionInstance = async (
    userId: string | undefined,
    webhookUrl: string
  ) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createEvolution({
        userId,
        webhookUrl,
      });

      if (result.success) {
        toast.success("Nova instância criada com sucesso!");
      } else {
        toast.error(result.error || "Erro ao criar nova instância");
      }
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      toast.error("Ocorreu um erro ao criar a nova instância");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSaveRedisKey,
    handleSaveWhatsappPhone,
    handleCreateEvolutionInstance,
  };
};
