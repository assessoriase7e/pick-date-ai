"use client";

import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllProfessionals } from "@/actions/professionals/getAllProfessionals";
import { Professional } from "@prisma/client";

const linkSchema = z.object({
  url: z.string().url({
    message: "Por favor, insira uma URL válida.",
  }),
  title: z.string().min(1, {
    message: "O título é obrigatório.",
  }),
  description: z.string().min(1, {
    message: "A descrição é obrigatória.",
  }),
  professionalId: z.string().min(1, {
    message: "O profissional é obrigatório.",
  }),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface LinkFormProps {
  initialData?: {
    url: string;
    title: string;
    description: string;
    professionalId?: string;
  };
  onSubmit: (data: LinkFormValues) => Promise<void>;
  onCancel: () => void;
  professionals?: Professional[]; // Add this line to accept professionals prop
}

export function LinkForm({ initialData, onSubmit, onCancel }: LinkFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>(
    [] as Professional[]
  );

  useEffect(() => {
    async function loadProfessionals() {
      const result = await getAllProfessionals();
      if (result.success) {
        setProfessionals(result.data);
      } else {
        toast("Erro ao carregar profissionais");
      }
    }

    loadProfessionals();
  }, []);

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      url: initialData?.url || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      professionalId: initialData?.professionalId || "",
    },
  });

  const handleSubmit: SubmitHandler<LinkFormValues> = async (data) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      form.reset();
    } catch (error) {
      toast("Ocorreu um erro ao salvar o link.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite a descrição do link"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professionalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
