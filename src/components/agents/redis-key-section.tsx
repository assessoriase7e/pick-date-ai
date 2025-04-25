"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveRedisKey } from "@/actions/agents/redis-key";

interface FormData {
  redisKey: string;
}

export function RedisKeySection({
  phoneNumber,
  redisKey,
}: {
  phoneNumber: string;
  redisKey: string;
}) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      redisKey,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveRedisKey({
        userId: user.id,
        key: data.redisKey,
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Chave Redis</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <p className="text-sm text-muted-foreground">
          A chave Redis é baseada no número de telefone do seu perfil.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1 flex">
            <div className="h-10 font-semibold bg-card text-xs flex items-center justify-center px-5 rounded-lg rounded-r-none">
              {phoneNumber}
            </div>
            <Input
              {...register("redisKey", {
                required: "A chave Redis é obrigatória.",
              })}
              className="rounded-none rounded-r-lg"
              placeholder="Digite o complemento da chave Redis"
            />
            {errors.redisKey && (
              <p className="text-sm text-red-500 mt-1">
                {errors.redisKey.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
