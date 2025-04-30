"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { serviceSchema, ServiceFormValues } from "@/validators/service";
import { createService } from "@/actions/services/create-service";
import { updateService } from "@/actions/services/update-service";

interface ServiceFormProps {
  initialData?: any;
  onSuccess: () => void;
  collaborators: any[];
}

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export function ServiceForm({
  initialData,
  onSuccess,
  collaborators,
}: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      availableDays: initialData?.availableDays || [],
      notes: initialData?.notes || "",
      collaboratorId: initialData?.collaboratorId || "none",
      durationMinutes: initialData?.durationMinutes || 30,
      commission: initialData?.commission || 0,
    },
  });

  const onSubmit = async (values: ServiceFormValues) => {
    setIsLoading(true);
    try {
      // Convert "none" value to null or empty string
      const submissionValues = {
        ...values,
        collaboratorId:
          values.collaboratorId === "none" ? null : values.collaboratorId,
      };

      if (isEditing) {
        const result = await updateService(initialData.id, submissionValues);
        if (result.success) {
          toast.success("Serviço atualizado com sucesso");
          onSuccess();
        } else {
          toast.error(result.error || "Erro ao atualizar serviço");
        }
      } else {
        const result = await createService(submissionValues);
        if (result.success) {
          toast.success("Serviço criado com sucesso");
          onSuccess();
        } else {
          toast.error(result.error || "Erro ao criar serviço");
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
                <Input placeholder="Nome do serviço" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  placeholder="R$ 0,00"
                  value={value}
                  onValueChange={(values) => {
                    onChange(values.floatValue);
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availableDays"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Dias Disponíveis</FormLabel>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DAYS_OF_WEEK.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="availableDays"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={day}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, day])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== day
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{day}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collaboratorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colaborador</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colaborador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {collaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Associe este serviço a um colaborador específico.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="Ex: 30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comissão</FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  suffix="%"
                  decimalScale={0}
                  maxLength={4}
                  fixedDecimalScale
                  placeholder="10%"
                  {...field}
                  defaultValue={field.value || 0}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o serviço"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Salvando..."
              : isEditing
              ? "Atualizar Serviço"
              : "Criar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
