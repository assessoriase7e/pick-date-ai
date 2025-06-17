import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PatternFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createSession } from "@/actions/agents/waha/create-session";
// Remove this import for now since we haven't created the action yet
// import { updateSession } from "@/actions/agents/waha/update-session";
import { wahaFormSchema } from "@/validators/waha";

interface SessionFormProps {
  initialData?: any;
  onSuccess: () => void;
  profilePhone?: string;
  companyName?: string;
}

export function SessionForm({ initialData, onSuccess, profilePhone, companyName }: SessionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof wahaFormSchema>>({
    resolver: zodResolver(wahaFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      number: initialData?.number || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof wahaFormSchema>) => {
    setIsLoading(true);
    try {
      const cleanNumber = values.number.replace(/\D/g, "");
      const company = (companyName || "empresa").toLowerCase().replace(/\s+/g, "_");
      // Mudança aqui: usar underscore em vez de @ para compatibilidade com WAHA
      const sessionName = `${cleanNumber}_${company}`;
      const submissionValues = {
        ...values,
        name: sessionName,
      };

      if (isEditing) {
        // TODO: Implementar updateSession quando necessário
        toast.error("Edição ainda não implementada");
      } else {
        const result = await createSession(submissionValues);
        if (result.success) {
          toast.success("Sessão criada com sucesso");
          onSuccess();
        } else {
          toast.error("Erro ao criar sessão");
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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
