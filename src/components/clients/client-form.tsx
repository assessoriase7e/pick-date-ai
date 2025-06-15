"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { saveClient } from "@/actions/clients/save-client";
import { clientSchema, ClientFormValues } from "@/validators/client";
import { PatternFormat } from "react-number-format";
import { YearInputCalendar } from "@/components/ui/year-input-calendar";
import { revalidatePathAction } from "@/actions/revalidate-path";

interface ClientFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const { toast } = useToast();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : undefined,
      observations: initialData?.observations || "",
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    const result = await saveClient(data);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Cliente salvo com sucesso",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        revalidatePathAction("/clients");
      }

      revalidatePathAction("/clients");
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao salvar cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do cliente" {...field} />
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
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <YearInputCalendar
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione a data de nascimento"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações sobre o cliente" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) {
                onSuccess();
              } else {
                revalidatePathAction("/clients");
              }
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
