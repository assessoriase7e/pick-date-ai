import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAttendantHandler } from "@/handles/attendant-handler";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getPrompts } from "@/actions/agents/prompts";
import { AttendantPrompt } from "@/types/prompt";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface AttendantTabProps {
  onSave?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading?: (value: boolean) => void;
}

export function AttendantTab({
  onSave,
  isLoading,
  setIsLoading,
}: AttendantTabProps) {
  const { user } = useUser();
  const { handleSaveAttendantPrompt } = useAttendantHandler();
  const [isActive, setIsActive] = useState(false);

  type FormValues = {
    presentation: string;
    speechStyle: string;
    expressionInterpretation: string;
    schedulingScript: string;
    rules: string;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      presentation: "",
      speechStyle: "",
      expressionInterpretation: "",
      schedulingScript: "",
      rules: "",
    },
  });

  useEffect(() => {
    async function loadAttendantPrompt() {
      if (!user?.id) return;

      try {
        const result = await getPrompts(user.id);
        if (!result.success || !result.data?.prompts) return;

        const attendantPrompt = result.data.prompts.find(
          (prompt) => prompt.type === "Atendente"
        ) as AttendantPrompt | undefined;

        if (!attendantPrompt) return;

        setIsActive(attendantPrompt.isActive);

        const {
          presentation = "",
          speechStyle = "",
          expressionInterpretation = "",
          schedulingScript = "",
          rules = "",
        } = attendantPrompt;

        form.reset({
          presentation,
          speechStyle,
          expressionInterpretation,
          schedulingScript,
          rules,
        });
      } catch (error) {
        console.error("Erro ao carregar prompt do atendente:", error);
      }
    }

    loadAttendantPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSave = async (values: FormValues) => {
    if (onSave) {
      return onSave();
    }

    if (setIsLoading) setIsLoading(true);
    try {
      const content = `Apresentação: ${values.presentation}\n\nEstilo da Fala: ${values.speechStyle}\n\nInterpretação de Expressões: ${values.expressionInterpretation}\n\nScript de Agendamento: ${values.schedulingScript}\n\nRegras: ${values.rules}`;

      await handleSaveAttendantPrompt(
        user?.id,
        content,
        isActive,
        values.presentation,
        values.speechStyle,
        values.expressionInterpretation,
        values.schedulingScript,
        values.rules
      );
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="attendant-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="attendant-active">Ativar</Label>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
          <FormField
            control={form.control}
            name="presentation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apresentação</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite a apresentação do atendente..."
                    className="min-h-[100px] mt-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="speechStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estilo da Fala</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o estilo de fala do atendente..."
                    className="min-h-[100px] mt-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expressionInterpretation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interpretação de Expressões</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Como o atendente deve interpretar expressões..."
                    className="min-h-[100px] mt-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedulingScript"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Script de Agendamento</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Script para agendamento..."
                    className="min-h-[100px] mt-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regras</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Regras para o atendente seguir..."
                    className="min-h-[100px] mt-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
