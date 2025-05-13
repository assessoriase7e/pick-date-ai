"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { blackListSchema, BlackListFormValues } from "@/validators/blacklist";
import { saveBlackList } from "@/actions/agents/blacklist/save-blacklist";
import { PatternFormat } from "react-number-format";
import { X } from "lucide-react";

interface BlackListTabProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  initialData?: {
    id?: string;
    phones: string[];
  };
}

export function BlackListTab({
  isLoading,
  setIsLoading,
  initialData,
}: BlackListTabProps) {
  const { toast } = useToast();

  const form = useForm<BlackListFormValues>({
    resolver: zodResolver(blackListSchema),
    defaultValues: {
      id: initialData?.id,
      phones: initialData?.phones?.length ? initialData.phones : [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "phones" as const,
  });

  const onSubmit = async (data: BlackListFormValues) => {
    setIsLoading(true);
    try {
      // Filtra números vazios antes de salvar
      const filteredData = {
        ...data,
        phones: data.phones.filter((phone) => phone.trim() !== ""),
      };

      const result = await saveBlackList(filteredData);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Lista negra salva com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao salvar lista negra",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a lista negra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Números Bloqueados</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append("")}
            >
              Adicionar Número
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`phones.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Lista Negra"}
        </Button>
      </form>
    </Form>
  );
}
