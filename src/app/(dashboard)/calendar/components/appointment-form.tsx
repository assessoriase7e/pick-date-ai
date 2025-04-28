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
import { getClients } from "@/actions/clients/get-clients";
import { getServices } from "@/actions/services/get-services";

import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments/update";
import { createAppointment } from "@/actions/appointments/create";
import { deleteAppointment } from "@/actions/appointments/delete";
import { createAppointmentSchema } from "@/validators/calendar";
import { Input } from "@/components/ui/input";

type FormValues = z.infer<typeof createAppointmentSchema>;

interface Client {
  id: string;
  fullName: string;
}

interface Service {
  id: string;
  name: string;
}

interface AppointmentFormProps {
  date: Date;
  appointment?: {
    id: string;
    clientId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppointmentForm({
  date,
  appointment,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = !!appointment;

  const form = useForm<FormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: appointment
      ? {
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          startTime: `${appointment.startTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${appointment.startTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          endTime: `${appointment.endTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${appointment.endTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          notes: appointment.notes || "",
        }
      : {
          startTime: "09:00",
          endTime: "10:00",
          notes: "",
        },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, servicesData] = await Promise.all([
          getClients(),
          getServices(),
        ]);

        setClients(Array.isArray(clientsData) ? clientsData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      }
    };

    loadData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const [endHour, endMinute] = values.endTime.split(":").map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHour);
      startTime.setMinutes(startMinute);

      const endTime = new Date(date);
      endTime.setHours(endHour);
      endTime.setMinutes(endMinute);

      // Validar se o horário de término é depois do horário de início
      if (endTime <= startTime) {
        toast.error(
          "O horário de término deve ser depois do horário de início"
        );
        return;
      }

      const appointmentData = {
        clientId: values.clientId,
        serviceId: values.serviceId,
        startTime,
        endTime,
        notes: values.notes ?? null,
        status: "scheduled",
        calendarId: "default",
      };

      if (isEditing && appointment) {
        await updateAppointment(appointment.id, appointmentData);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        await createAppointment(appointmentData);
        toast.success("Agendamento criado com sucesso!");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error("Erro ao salvar agendamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;

    try {
      setIsDeleting(true);
      await deleteAppointment(appointment.id);
      toast.success("Agendamento cancelado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Gerar opções de horas e minutos
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-10">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cliente</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? clients.find((client) => client.id === field.value)
                            ?.fullName
                        : "Selecione um cliente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.id}
                          onSelect={() => {
                            form.setValue("clientId", client.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              client.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {client.fullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Serviço</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? services.find((service) => service.id === field.value)
                            ?.name
                        : "Selecione um serviço"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar serviço..." />
                    <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {services.map((service) => (
                        <CommandItem
                          key={service.id}
                          value={service.id}
                          onSelect={() => {
                            form.setValue("serviceId", service.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              service.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {service.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
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

        <div className="flex justify-between pt-4">
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
