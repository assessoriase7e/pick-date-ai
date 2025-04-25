import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAttendantHandler } from "@/handles/attendant-handler";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { getAttendantPrompt } from "@/actions/agents/attendant/get-attendant-prompt";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

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

  type FormValues = {
    isActive: boolean;
    presentation: string;
    speechStyle: string;
    expressionInterpretation: string;
    schedulingScript: string;
    rules: string;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      isActive: false,
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
        const result = await getAttendantPrompt(user.id);
        if (!result.success || !result.data?.attendantPrompt) return;

        const attendantPrompt = result.data.attendantPrompt;

        if (!attendantPrompt) return;

        const {
          isActive = false,
          presentation = "",
          speechStyle = "",
          expressionInterpretation = "",
          schedulingScript = "",
          rules = "",
        } = attendantPrompt;

        form.reset({
          isActive,
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
        values.isActive,
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
      <Form {...form}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-4"
            >
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
          </div>

          <div className="w-full lg:w-1/2 mt-6 lg:mt-0">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Visualização do Prompt
                </h3>
                <div className="whitespace-pre-wrap text-sm">
                  <div className="mb-4">
                    <div className="font-medium">#Apresentação</div>
                    <div className="pl-4 mt-1">
                      {form.watch("presentation")}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium">#Estilo da Fala</div>
                    <div className="pl-4 mt-1">{form.watch("speechStyle")}</div>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium">
                      #Interpretação de Expressões
                    </div>
                    <div className="pl-4 mt-1">
                      {form.watch("expressionInterpretation")}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium">#Script de Agendamento</div>
                    <div className="pl-4 mt-1">
                      {form.watch("schedulingScript")}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium">#Regras</div>
                    <div className="pl-4 mt-1">{form.watch("rules")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
