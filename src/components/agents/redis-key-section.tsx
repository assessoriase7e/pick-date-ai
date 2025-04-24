"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRedisKey, saveRedisKey } from "@/actions/agents/redis-key";

export function RedisKeySection() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [redisKey, setRedisKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [baseKey, setBaseKey] = useState("");

  useEffect(() => {
    loadRedisKey();
    loadPhoneNumber();
  }, [user?.id]);

  const loadRedisKey = async () => {
    if (!user?.id) return;

    try {
      const result = await getRedisKey(user.id);
      // Add proper null check for result.data
      if (result.success && result.data?.redisKey) {
        setRedisKey(result.data.redisKey.key);
      }
    } catch (error) {
      console.error("Erro ao carregar chave Redis:", error);
    }
  };

  const loadPhoneNumber = async () => {
    if (!user?.id) return;

    try {
      // Aqui você pode carregar o número de telefone do perfil
      // Exemplo simplificado:
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (data.success && data.profile?.phone) {
        setPhoneNumber(data.profile.phone);
        setBaseKey(data.profile.phone);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const handleSaveRedisKey = async () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveRedisKey({
        userId: user.id,
        key: redisKey,
      });

      if (result.success) {
        toast.success("Chave Redis salva com sucesso");
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

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRedisKey(e.target.value);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Chave Redis</h2>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          A chave Redis é baseada no número de telefone do seu perfil.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              value={redisKey}
              onChange={handleKeyChange}
              placeholder="Digite a chave Redis"
            />
          </div>
          <Button onClick={handleSaveRedisKey} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {phoneNumber && (
          <p className="text-xs text-muted-foreground mt-2">
            Base da chave: {phoneNumber}
          </p>
        )}
      </div>
    </div>
  );
}
