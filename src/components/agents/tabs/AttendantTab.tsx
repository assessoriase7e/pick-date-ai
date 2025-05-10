"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAttendantHandler } from "@/handles/attendant-handler";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExpressionFieldArray } from "./expression-field-array";
import { SchedulingScriptFieldArray } from "./scheduling-script-field-array";
import { RulesFieldArray } from "./rules-field-array";
import { MessageSquare, Coffee, Handshake } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  parseExpressionInterpretation,
  parseSchedulingScript,
  parseRules,
} from "@/utils/form-parsers";
import { defaultRules } from "@/mocked/attendant-mock-data";
import { PatternFormat } from "react-number-format";
import {
  attendantFormSchema,
  AttendantFormValues,
} from "@/validators/attendant";

interface AttendantTabProps {
  onSave?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading?: (value: boolean) => void;
  initialData?: {
    isActive: boolean;
    content: string;
    presentation: string;
    speechStyle: string;
    expressionInterpretation: string;
    schedulingScript: string;
    rules: string;
  };
}

export function AttendantTab({
  onSave,
  isLoading,
  setIsLoading,
  initialData,
}: AttendantTabProps) {
  const { user } = useUser();
  const { handleSaveAttendantPrompt } = useAttendantHandler();

  const form = useForm<AttendantFormValues>({
    resolver: zodResolver(attendantFormSchema),
    defaultValues: {
      isActive: initialData?.isActive || false,
      presentation: initialData?.presentation || "",
      speechStyle: initialData?.speechStyle || "normal",
      expressionInterpretation: parseExpressionInterpretation(
        initialData?.expressionInterpretation || ""
      ),
      schedulingScript: parseSchedulingScript(
        initialData?.schedulingScript || ""
      ),
      rules: initialData?.rules ? parseRules(initialData.rules) : defaultRules,
      suportPhone: "",
    },
  });

  const handleSave = async (values: AttendantFormValues) => {
    if (onSave) {
      return onSave();
    }

    if (setIsLoading) setIsLoading(true);
    try {
      // Formatar expressões
      const expressionText = values.expressionInterpretation
        .map((item) => `${item.expression}: ${item.translation}`)
        .join("\n");

      // Formatar script de agendamento
      const scriptText = values.schedulingScript
        .map((item) => item.step)
        .join("\n");

      // Formatar regras (incluindo as mockadas)
      const userRules = values.rules.map((item) => item.rule);
      const mockedRules = defaultRules.map((item) => item.rule);
      const allRules = [...userRules, ...mockedRules];
      const rulesText = allRules.join("\n");

      // Enviar o valor do estilo diretamente, sem buscar no speechStyleOptions
      const speechStyleText = values.speechStyle;

      const content = `Apresentação: ${values.presentation}\n\nEstilo da Fala: ${speechStyleText}\n\nInterpretação de Expressões: ${expressionText}\n\nScript de Agendamento: ${scriptText}\n\nRegras: ${rulesText}`;

      await handleSaveAttendantPrompt(
        user?.id,
        content,
        values.isActive,
        values.presentation,
        speechStyleText,
        expressionText,
        scriptText,
        rulesText
      );
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <FormField
            control={form.control}
            name="presentation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apresentação</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite a apresentação do atendente..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <Separator />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="speechStyle"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Estilo da Fala</FormLabel>
                <FormControl>
                  <div className="flex gap-4">
                    {[
                      {
                        id: "normal",
                        label: "Normal",
                        icon: MessageSquare,
                      },
                      { id: "informal", label: "Informal", icon: Coffee },
                      { id: "formal", label: "Formal", icon: Handshake },
                    ].map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={
                          field.value === option.id ? "default" : "outline"
                        }
                        className="flex-1 flex items-center gap-2 h-16"
                        onClick={() => field.onChange(option.id)}
                      >
                        <option.icon className="h-5 w-5" />
                        <span>{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
                <Separator />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expressionInterpretation"
            render={({ field }) => (
              <FormItem>
                <ExpressionFieldArray
                  control={form.control}
                  name="expressionInterpretation"
                />
                <FormMessage />
                <Separator />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedulingScript"
            render={({ field }) => (
              <FormItem>
                <SchedulingScriptFieldArray
                  control={form.control}
                  name="schedulingScript"
                />
                <FormMessage />
                <Separator />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rules"
            render={({ field }) => (
              <FormItem>
                <RulesFieldArray control={form.control} name="rules" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="suportPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Whatsapp do suporte</FormLabel>
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
                <p className="text-xs text-muted-foreground">
                  Quando o agente identificar que o cliente necessita de
                  suporte, uma mensagem será enviada nesse whatsapp com o nome e
                  telefone do mesmo.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        id="attendant-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="attendant-active">Ativar</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
