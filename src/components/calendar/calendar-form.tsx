"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarFormValues, calendarSchema } from "@/validators/calendar";
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
import { Loader2 } from "lucide-react";
import { Calendar } from "@prisma/client";
import { SelectWithScroll } from "./select-with-scroll";
import { CollaboratorFullData } from "@/types/collaborator";
import { Switch } from "../ui/switch";

interface CalendarFormProps {
  onSubmit: (values: CalendarFormValues) => Promise<void>;
  calendar?: Calendar;
  collaborators: CollaboratorFullData[];
}

export function CalendarForm({
  onSubmit,
  calendar,
  collaborators,
}: CalendarFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: calendar
      ? {
          name: calendar?.name || "",
          collaboratorId: calendar.collaboratorId || undefined,
          isActive: calendar?.isActive ?? true,
        }
      : {
          name: "",
          collaboratorId: undefined,
          isActive: true,
        },
  });

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
            <SelectWithScroll
              label="Profissional"
              placeholder="Selecione um profissional"
              options={collaborators}
              value={field.value}
              onChange={field.onChange}
              getOptionLabel={(option) => option?.name}
              getOptionValue={(option) => String(option.id)}
              error={form.formState.errors.collaboratorId?.message}
            />
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status da Agenda</FormLabel>
                <FormDescription>
                  Defina se esta agenda está ativa ou inativa
                </FormDescription>
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {calendar ? "Atualizar" : "Criar"} Calendário
        </Button>
      </form>
    </Form>
  );
}
