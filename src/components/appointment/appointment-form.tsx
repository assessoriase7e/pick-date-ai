"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getServices } from "@/actions/services/get-services";

import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments/update";
import { createAppointment } from "@/actions/appointments/create";
import { deleteAppointment } from "@/actions/appointments/delete";
import { createAppointmentSchema } from "@/validators/calendar";
import moment from "moment";
import { AppointmentFullData } from "@/types/calendar";
import { getClients } from "@/actions/clients/get-clients";
import { Client, Service } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

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

  // Função para verificar se um serviço está disponível no dia selecionado
  const isServiceAvailableOnDay = (service: Service): boolean => {
    if (!service.availableDays || service.availableDays.length === 0) {
      return true; // Se não houver dias definidos, consideramos disponível todos os dias
    }

    const dayOfWeek = moment(date).locale("pt-br").format("dddd");
    const formattedDay =
      dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1) + "-feira";

    // Tratamento especial para sábado e domingo
    const dayName =
      dayOfWeek === "sábado"
        ? "Sábado"
        : dayOfWeek === "domingo"
        ? "Domingo"
        : formattedDay;

    return service.availableDays.includes(dayName);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsResult = await getClients();
        if (clientsResult.success) {
          setClients(clientsResult?.data?.clients || []);
        } else {
          toast.error(clientsResult.error || "Erro ao carregar clientes");
        }

        const servicesResult = await getServices();
        if (servicesResult.success) {
          setServices(servicesResult.data || []);
        } else {
          toast.error(servicesResult.error || "Erro ao carregar serviços");
        }
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
      toast.error("Ocorreu um erro ao salvar o agendamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteAppointment(appointment.id);
      if (!result.success) {
        throw new Error(result.error || "Erro ao excluir agendamento");
      }
      toast.success("Agendamento excluído com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Ocorreu um erro ao excluir o agendamento");
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
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => {
                    const isAvailable = isServiceAvailableOnDay(service);
                    return (
                      <SelectItem
                        key={service.id}
                        value={service.id}
                        disabled={!isAvailable}
                        className={
                          !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                        }
                      >
                        {service.name}{" "}
                        {!isAvailable && "(Indisponível neste dia)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Adicione observações sobre o agendamento"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={isEditing ? "" : "w-full"}
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
