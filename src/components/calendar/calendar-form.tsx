"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarFormValues, calendarSchema } from "@/validators/calendar";
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
import { Loader2 } from "lucide-react";
import { Calendar, Collaborator } from "@prisma/client";
import { listCollaborators } from "@/actions/collaborators/getMany";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarFormProps {
  onSubmit: (values: CalendarFormValues) => Promise<void>;
  calendar?: Calendar;
}

export function CalendarForm({ onSubmit, calendar }: CalendarFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: calendar
      ? {
          name: calendar.name,
          collaboratorId: calendar.collaboratorId || undefined,
        }
      : {
          name: "",
          collaboratorId: undefined,
        },
  });

  useEffect(() => {
    const loadCollaborators = async () => {
      try {
        const response = await listCollaborators();
        if (response.success && response.data) {
          setCollaborators(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
      }
    };

    loadCollaborators();
  }, []);

  const handleSubmit = async (values: CalendarFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar calendário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Calendário</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do calendário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collaboratorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collaborators.map((collaborator) => (
                    <SelectItem
                      key={collaborator.id}
                      value={String(collaborator.id)}
                    >
                      {collaborator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {calendar ? "Atualizar" : "Criar"} Calendário
        </Button>
      </form>
    </Form>
  );
}
