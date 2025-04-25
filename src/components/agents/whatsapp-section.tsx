"use client";

import { useForm, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveWhatsapp } from "@/actions/agents/whatsapp";
import { User } from "@clerk/nextjs/server";
import { useState } from "react";

interface FormData {
  phoneNumber: string;
}

export function WhatsappSection({
  whatsappNumber,
  user,
}: {
  whatsappNumber?: string;
  user: User;
}) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phoneNumber: whatsappNumber || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await saveWhatsapp({
        userId: user.id,
        phoneNumber: data.phoneNumber.replace(/\D/g, ""), // Remove a formatação
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Whatsapp</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Digite o número do Whatsapp no formato (99) 99999-9999.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Controller
              name="phoneNumber"
              control={control}
              rules={{
                required: "O número do Whatsapp é obrigatório.",
                minLength: {
                  value: 14,
                  message: "O número deve ter pelo menos 10 dígitos.",
                },
                maxLength: {
                  value: 15,
                  message: "O número deve ter no máximo 11 dígitos.",
                },
              }}
              render={({ field }) => (
                <PatternFormat
                  {...field}
                  format="(##) #####-####"
                  mask="_"
                  placeholder="(99) 99999-9999"
                  customInput={Input}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
