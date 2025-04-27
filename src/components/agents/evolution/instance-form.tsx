"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PatternFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createInstance,
  CreateInstanceFormValues,
} from "@/actions/agents/evolution/create-instance";
import {
  updateInstance,
  UpdateInstanceFormValues,
} from "@/actions/agents/evolution/update-instance";
import { evolutionFormSchema } from "@/validators/evolution";

interface InstanceFormProps {
  initialData?: any;
  onSuccess: () => void;
  profilePhone?: string;
}

export function InstanceForm({
  initialData,
  onSuccess,
  profilePhone,
}: InstanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof evolutionFormSchema>>({
    resolver: zodResolver(evolutionFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      number: initialData?.number || profilePhone || "",
      qrCode: initialData?.qrCode ?? true,
      webhookUrl: initialData?.webhookUrl || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof evolutionFormSchema>) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const result = await updateInstance(values as UpdateInstanceFormValues);
        if (result.success) {
          toast.success("Instância atualizada com sucesso");
          onSuccess();
        } else {
          toast.error(result.error || "Erro ao atualizar instância");
        }
      } else {
        const result = await createInstance(values as CreateInstanceFormValues);
        if (result.success) {
          toast.success("Instância criada com sucesso");
          onSuccess();
        } else {
          toast.error(result.error || "Erro ao criar instância");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar a solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da instância" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <PatternFormat
                  customInput={Input}
                  format="#############"
                  mask="_"
                  placeholder="55 + Número do WhatsApp"
                  value={field.value}
                  onValueChange={(values) => {
                    field.onChange(values.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="qrCode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>QR Code</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Ativar QR Code para autenticação
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/webhook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
