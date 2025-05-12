"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createCollaborator } from "@/actions/collaborators/create-collaborator";
import { updateCollaborator } from "@/actions/collaborators/update-collaborator";
import { useToast } from "@/components/ui/use-toast";
import { collaboratorSchema } from "@/validators/collaborator";
import { collabRoles } from "@/mocked/collabs";
import { PatternFormat } from "react-number-format";

interface CollaboratorFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function CollaboratorForm({
  initialData,
  onSuccess,
}: CollaboratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof collaboratorSchema>>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: initialData?.name || "",
      workingHours: initialData?.workingHours || "",
      phone: initialData?.phone || "",
      profession: initialData?.profession || "",
      description: initialData?.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof collaboratorSchema>) {
    setIsLoading(true);
    try {
      let result;

      if (initialData) {
        result = await updateCollaborator({
          id: initialData.id,
          ...values,
        });
      } else {
        result = await createCollaborator(values);
      }

      if (result.success) {
        toast({
          title: initialData
            ? "Profissional atualizado"
            : "Profissional criado",
          description: initialData
            ? "O profissional foi atualizado com sucesso."
            : "O profissional foi criado com sucesso.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          variant: "destructive",
          title: initialData
            ? "Erro ao atualizar profissional"
            : "Erro ao criar profissional",
          description:
            result.error || "Ocorreu um erro ao processar a solicitação.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: initialData
          ? "Erro ao atualizar profissional"
          : "Erro ao criar profissional",
        description: "Ocorreu um erro ao processar a solicitação.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do profissional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horários de Atendimento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Segunda a Sexta, 9h às 18h"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informe os dias e horários em que o profissional atende.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <PatternFormat
                  format="(##) #####-####"
                  mask="_"
                  customInput={Input}
                  placeholder="(00) 00000-0000"
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
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma profissão" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collabRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Descreva o profissional, suas habilidades e experiência"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Salvar"}
        </Button>
      </form>
    </Form>
  );
}
