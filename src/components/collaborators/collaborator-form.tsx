"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createCollaborator } from "@/actions/collaborators/create-collaborator";
import { updateCollaborator } from "@/actions/collaborators/update-collaborator";
import { useToast } from "@/components/ui/use-toast";
import { collaboratorSchema } from "@/validators/collaborator";
import { collabRoles } from "@/mocked/collabs";
import { PatternFormat } from "react-number-format";
import { Plus, X } from "lucide-react";
import { FullCollaborator } from "@/types/calendar";

interface CollaboratorFormProps {
  initialData?: FullCollaborator;
  onSuccess?: () => void;
}

const daysOfWeek = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export function CollaboratorForm({ initialData, onSuccess }: CollaboratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof collaboratorSchema>>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: initialData?.name || "",
      workHours: initialData?.workHours || [
        {
          day: "Segunda-feira",
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
        },
      ],
      phone: initialData?.phone || "",
      profession: initialData?.profession || "",
      description: initialData?.description || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workHours",
  });

  async function onSubmit(values: any) {
    setIsLoading(true);
    try {
      let result;

      if (initialData) {
        result = await updateCollaborator(initialData.id, {
          ...values,
          userId: initialData.userId,
        });
      } else {
        result = await createCollaborator(values);
      }

      if (result.success) {
        toast({
          title: initialData ? "Profissional atualizado" : "Profissional criado",
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
          title: initialData ? "Erro ao atualizar profissional" : "Erro ao criar profissional",
          description: result.error || "Ocorreu um erro ao processar a solicitação.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: initialData ? "Erro ao atualizar profissional" : "Erro ao criar profissional",
        description: "Ocorreu um erro ao processar a solicitação.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Check if day is already selected in another schedule
  const isDayAlreadySelected = (selectedDay: string, currentIndex: number) => {
    return fields.some((field, index) => index !== currentIndex && field.day === selectedDay);
  };

  // Get available days for selection
  const getAvailableDays = (currentIndex: number) => {
    const selectedDays = new Set<string>();

    fields.forEach((field, index) => {
      if (index !== currentIndex && field.day) {
        selectedDays.add(field.day);
      }
    });

    return daysOfWeek.filter((day) => !selectedDays.has(day));
  };

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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Horários de Atendimento</FormLabel>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Horário {index + 1}</h4>

                <X
                  className="w-8 h-8 hover:text-red-500 transition cursor-pointer"
                  onClick={() => fields.length > 1 && remove(index)}
                />
              </div>
              <FormField
                control={form.control}
                name={`workHours.${index}.day`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        // Prevent selecting days that are already used
                        if (isDayAlreadySelected(value, index)) {
                          toast({
                            variant: "destructive",
                            title: "Dia já selecionado",
                            description: "Este dia da semana já está em uso em outro horário.",
                          });
                          return;
                        }
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Only show days that aren't selected in other schedules */}
                        {daysOfWeek.map((day) => (
                          <SelectItem
                            key={day}
                            value={day}
                            disabled={day !== field.value && isDayAlreadySelected(day, index)}
                          >
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`workHours.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`workHours.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`workHours.${index}.breakStart`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início do Intervalo</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`workHours.${index}.breakEnd`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim do Intervalo</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                day: getAvailableDays(-1)[0] || "Segunda-feira",
                startTime: "09:00",
                endTime: "18:00",
                breakStart: "12:00",
                breakEnd: "13:00",
              })
            }
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Horário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
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
              <FormItem className="w-full">
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
        </div>

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
