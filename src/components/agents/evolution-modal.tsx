"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Evolution } from "@prisma/client";
import { createInstance } from "@/actions/agents/evolution/create-instance";
import { updateInstance } from "@/actions/agents/evolution/update-instance";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const formSchema = z.object({
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  webhookUrl: z.string().url("URL de webhook inválida"),
  qrCode: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: Evolution | null;
  phoneNumber: string;
}

export function EvolutionModal({
  isOpen,
  onClose,
  instance,
  phoneNumber,
}: EvolutionModalProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instanceName: instance?.instanceName || "",
      number: instance?.number || phoneNumber || "",
      webhookUrl: instance?.webhookUrl || "",
      qrCode: instance?.qrCode ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsSubmitting(true);
    try {
      if (instance) {
        // Atualizar instância existente
        const result = await updateInstance({
          id: instance.id,
          ...values,
        });

        if (result.success) {
          toast.success("Instância atualizada com sucesso");
          onClose();
        } else {
          toast.error(result.error || "Falha ao atualizar instância");
        }
      } else {
        // Criar nova instância
        const result = await createInstance({
          userId: user.id,
          ...values,
        });

        if (result.success) {
          toast.success("Instância criada com sucesso");
          onClose();
        } else {
          toast.error(result.error || "Falha ao criar instância");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar a solicitação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {instance ? "Editar Instância" : "Nova Instância"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="instanceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Instância</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha Instância" {...field} />
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
                  <FormLabel>Número WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="5511999999999" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Webhook</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/webhook"
                      {...field}
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
                    <FormLabel>Gerar QR Code</FormLabel>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Processando..."
                  : instance
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}