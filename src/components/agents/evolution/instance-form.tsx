"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PatternFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInstance } from "@/actions/agents/evolution/create-instance";
import { updateInstance, UpdateInstanceFormValues } from "@/actions/agents/evolution/update-instance";
import { evolutionFormSchema } from "@/validators/evolution";

interface InstanceFormProps {
  initialData?: any;
  onSuccess: () => void;
  profilePhone?: string;
  companyName?: string;
}

export function InstanceForm({ initialData, onSuccess, profilePhone, companyName }: InstanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof evolutionFormSchema>>({
    resolver: zodResolver(evolutionFormSchema),
    defaultValues: {
      number: initialData?.number || "",
      qrCode: initialData?.qrCode ?? true,
      type: initialData?.type || "attendant",
    },
  });

  const onSubmit = async (values: z.infer<typeof evolutionFormSchema>) => {
    setIsLoading(true);
    try {
      const cleanNumber = values.number.replace(/\D/g, "");
      const company = (companyName || "empresa").toLowerCase().replace(/\s+/g, "_");
      const instanceName = `${cleanNumber}@${company}`;
      const submissionValues = {
        ...values,
        name: instanceName,
      };

      if (isEditing) {
        const result = await updateInstance(submissionValues as UpdateInstanceFormValues);
        if (result.success) {
          toast.success("Instância atualizada com sucesso");
          onSuccess();
        } else {
          toast.error(result.error || "Erro ao atualizar instância");
        }
      } else {
        const result = await createInstance(submissionValues);
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
        {/* Removemos o campo de nome pois será gerado automaticamente */}
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <PatternFormat
                  customInput={Input}
                  format="+55(##)#####-####"
                  placeholder="(00)00000-0000"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="qrCode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>QR Code</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de Instância</FormLabel>
                <Select disabled={isEditing} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="attendant">Recepcionista</SelectItem>
                    <SelectItem value="sdr" disabled>
                      SDR (Em Breve)
                    </SelectItem>
                    <SelectItem value="followup" disabled>
                      Follow-up (Em Breve)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
