"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "@/components/ui/use-toast";

const professionalSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  phone: z.string().min(10, {
    message: "O telefone deve ter pelo menos 10 dígitos.",
  }),
  company: z.string().min(2, {
    message: "O nome da empresa deve ter pelo menos 2 caracteres.",
  }),
});

type ProfessionalFormValues = z.infer<typeof professionalSchema>;

interface ProfessionalFormProps {
  initialData?: ProfessionalFormValues;
  onSubmit: (data: ProfessionalFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ProfessionalForm({
  initialData,
  onSubmit,
  onCancel,
}: ProfessionalFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: initialData || {
      name: "",
      phone: "",
      company: "",
    },
  });

  async function handleSubmit(data: ProfessionalFormValues) {
    try {
      setIsLoading(true);
      // Remove non-numeric characters from phone before submitting
      const formattedData = {
        ...data,
        phone: data.phone.replace(/\D/g, ""),
      };
      await onSubmit(formattedData);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o profissional.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do profissional</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do profissional</FormLabel>
              <FormControl>
                <PhoneInput placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da empresa</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
}
