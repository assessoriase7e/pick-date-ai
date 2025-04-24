"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWhatsapp, saveWhatsapp } from "@/actions/agents/whatsapp";

export function WhatsappSection() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    loadWhatsapp();
  }, [user?.id]);

  const loadWhatsapp = async () => {
    if (!user?.id) return;

    try {
      const result = await getWhatsapp(user.id);
      // Add proper null check for result.data
      if (result.success && result.data?.whatsapp) {
        setPhoneNumber(result.data.whatsapp.phoneNumber);
      }
    } catch (error) {
      console.error("Erro ao carregar Whatsapp:", error);
    }
  };

  const handleSaveWhatsapp = async () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveWhatsapp({
        userId: user.id,
        phoneNumber,
      });

      if (result.success) {
        toast.success("Número do Whatsapp salvo com sucesso");
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remover qualquer caractere que não seja número
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Whatsapp</h2>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Digite o número do Whatsapp sem o código do país.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Digite o número do Whatsapp (apenas números)"
              maxLength={11}
            />
          </div>
          <Button onClick={handleSaveWhatsapp} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
