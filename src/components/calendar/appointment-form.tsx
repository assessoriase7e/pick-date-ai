"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getServices } from "@/actions/services/get-services";

import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments/update";
import { createAppointment } from "@/actions/appointments/create";
import { deleteAppointment } from "@/actions/appointments/delete";
import { createAppointmentSchema } from "@/validators/calendar";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { AppointmentFullData } from "@/types/calendar";
import { getClients } from "@/actions/clients/get-clients";
import { Client, Service } from "@prisma/client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ComboBoxResponsiveField } from "./combo-box-responsive-field";

type FormValues = z.infer<typeof createAppointmentSchema>;

interface AppointmentFormProps {
  date: Date;
  appointment?: AppointmentFullData;
  onSuccess: () => void;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => boolean;
  initialStartTime?: string | null;
  calendarId: string;
}

export function AppointmentForm({
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  initialStartTime,
  calendarId,
}: AppointmentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Novo estado para armazenar a duração do serviço selecionado
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<
    number | null
  >(null);

  const isEditing = !!appointment;

  const calculateDefaultEndTime = (startTime: string): string => {
    return moment(startTime, "HH:mm").add(1, "hour").format("HH:mm");
  };

  const defaultStartTime = initialStartTime ?? "09:00";
  const defaultEndTime = appointment?.endTime
    ? moment(appointment.endTime).format("HH:mm")
    : calculateDefaultEndTime(defaultStartTime);

  const form = useForm<FormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: appointment
      ? {
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          startTime: moment(appointment.startTime).format("HH:mm"),
          endTime: moment(appointment.endTime).format("HH:mm"),
          notes: appointment.notes || "",
          calendarId: calendarId,
        }
      : {
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          notes: "",
          calendarId,
        },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: clients } = await getClients();
        setClients(clients?.clients || []);

        const { data: services } = await getServices();
        setServices(services || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      }
    };

    loadData();
  }, []);

  // Atualiza a duração do serviço ao selecionar um serviço
  useEffect(() => {
    if (form.watch("serviceId")) {
      const service = services.find((s) => s.id === form.watch("serviceId"));
      setSelectedServiceDuration(service?.durationMinutes ?? null);
    }
  }, [form.watch("serviceId"), services]);

  // Atualiza o horário final automaticamente ao alterar o serviço ou o horário inicial
  useEffect(() => {
    const startTime = form.watch("startTime");
    if (selectedServiceDuration && startTime) {
      const newEndTime = moment(startTime, "HH:mm")
        .add(selectedServiceDuration, "minutes")
        .format("HH:mm");
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceDuration, form.watch("startTime")]);

  const onSubmit = async (values: FormValues) => {
    try {
      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const [endHour, endMinute] = values.endTime.split(":").map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHour);
      startTime.setMinutes(startMinute);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);

      const endTime = new Date(date);
      endTime.setHours(endHour);
      endTime.setMinutes(endMinute);
      endTime.setSeconds(0);
      endTime.setMilliseconds(0);

      if (endTime <= startTime) {
        toast.error(
          "O horário de término deve ser depois do horário de início"
        );
        return;
      }

      const hasConflict = checkTimeConflict(
        startTime,
        endTime,
        appointment?.id
      );
      if (hasConflict) {
        toast.error("Já existe um agendamento nesse horário");
        return;
      }

      setIsLoading(true);

      const appointmentData = {
        clientId: values.clientId,
        serviceId: values.serviceId,
        calendarId: calendarId,
        startTime,
        endTime,
        notes: values.notes || null,
        status: "scheduled",
      };

      if (isEditing && appointment) {
        const result = await updateAppointment(appointment.id!, {
          ...appointmentData,
          startTime,
          endTime,
          status: appointment.status || "scheduled",
        });
        if (!result.success) {
          throw new Error(result.error || "Erro ao atualizar agendamento");
        }
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        const result = await createAppointment(appointmentData);
        if (!result.success) {
          throw new Error(result.error || "Erro ao criar agendamento");
        }
        toast.success("Agendamento criado com sucesso!");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao salvar agendamento. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;

    try {
      setIsDeleting(true);
      await deleteAppointment(appointment.id!);
      toast.success("Agendamento cancelado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <ComboBoxResponsiveField
              label="Cliente"
              placeholder="Selecione um cliente"
              options={clients}
              value={field.value}
              onChange={(val) => form.setValue("clientId", val)}
              getOptionLabel={(client) => client.fullName}
              getOptionValue={(client) => client.id}
              error={form.formState.errors.clientId?.message}
            />
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <ComboBoxResponsiveField
              label="Serviço"
              placeholder="Selecione um serviço"
              options={services}
              value={field.value}
              onChange={(val) => {
                form.setValue("serviceId", val);
                const service = services.find((s) => s.id === val);
                setSelectedServiceDuration(service?.durationMinutes ?? null);
              }}
              getOptionLabel={(service) => service.name}
              getOptionValue={(service) => service.id}
              getOptionExtra={(service) =>
                service.durationMinutes ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({service.durationMinutes} min)
                  </span>
                ) : null
              }
              error={form.formState.errors.serviceId?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormLabel>Horário de início</FormLabel>
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="time"
                      className="input input-bordered w-full"
                      value={field.value || ""}
                      onChange={field.onChange}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormLabel>Horário de término</FormLabel>
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="time"
                      className="input input-bordered w-full"
                      value={field.value || ""}
                      onChange={field.onChange}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Adicione observações sobre o agendamento..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-5 lg:flex-row justify-between pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Atualizar Agendamento" : "Criar Agendamento"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancelar Agendamento
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
