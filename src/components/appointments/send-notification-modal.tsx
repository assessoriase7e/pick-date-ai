"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendAppointmentNotifications } from "@/actions/appointments/send-notifications";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, User, GripVertical } from "lucide-react";

const notificationSchema = z.object({
  date: z.date({
    required_error: "Selecione uma data",
  }),
  message: z.string().min(1, "A mensagem é obrigatória"),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface SendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultMessage = `Olá <client_name>! 👋

Lembramos que você tem um agendamento marcado para o dia <date>.

Aguardamos você!

Qualquer dúvida, entre em contato conosco.`;

const variables = [
  { label: "Cliente", value: "<client_name>", icon: User },
  { label: "Data", value: "<date>", icon: CalendarIcon },
];

export function SendNotificationModal({ open, onOpenChange }: SendNotificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [draggedVariable, setDraggedVariable] = useState<string | null>(null);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      message: defaultMessage,
    },
  });

  const handleDragStart = (variable: string) => {
    setDraggedVariable(variable);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedVariable) {
      const textarea = e.target as HTMLTextAreaElement;
      const cursorPosition = textarea.selectionStart;
      const currentMessage = form.getValues("message");
      const newMessage =
        currentMessage.slice(0, cursorPosition) + draggedVariable + currentMessage.slice(cursorPosition);

      form.setValue("message", newMessage);
      setDraggedVariable(null);
    }
  };

  const insertVariable = (variable: string) => {
    const currentMessage = form.getValues("message");
    form.setValue("message", currentMessage + variable);
  };

  const onSubmit = async (values: NotificationFormValues) => {
    setIsLoading(true);
    try {
      const result = await sendAppointmentNotifications({
        date: values.date,
        message: values.message,
      });

      if (result.success) {
        toast.success(`Avisos enviados com sucesso para ${result.count} agendamentos!`);
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Erro ao enviar avisos");
      }
    } catch (error) {
      toast.error("Erro inesperado ao enviar avisos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir Aviso de Agendamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 ">
            <Label>Selecione a data</Label>
            <div className="border rounded-md p-3 w-full flex flex-col items-center justify-center">
              <Calendar
                mode="single"
                selected={form.watch("date")}
                onSelect={(date) => date && form.setValue("date", date)}
                locale={ptBR}
                className="mx-auto"
              />
            </div>
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mensagem personalizada</Label>
            <Textarea
              {...form.register("message")}
              placeholder="Digite sua mensagem..."
              className="min-h-[120px] resize-none"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
            {form.formState.errors.message && (
              <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Variáveis disponíveis</Label>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => {
                const Icon = variable.icon;
                return (
                  <Badge
                    key={variable.value}
                    variant="secondary"
                    className="cursor-grab active:cursor-grabbing hover:bg-secondary/80 transition-colors px-3 py-2"
                    draggable
                    onDragStart={() => handleDragStart(variable.value)}
                    onClick={() => insertVariable(variable.value)}
                  >
                    <GripVertical className="h-3 w-3 mr-1" />
                    <Icon className="h-3 w-3 mr-1" />
                    {variable.label}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Arraste as badges para a mensagem ou clique para inserir no final do texto
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Avisos"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
