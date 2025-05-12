"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { SelectWithScroll } from "../calendar/select-with-scroll";
import { AppointmentFormProps } from "@/validators/appointment";
import { NumericFormat } from "react-number-format";
import { useEffect, useState } from "react";
import moment from "moment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppointmentSchema } from "@/validators/calendar";
import { toast } from "sonner";
import { createAppointment } from "@/actions/appointments/create";
import { updateAppointment } from "@/actions/appointments/update";
import { deleteAppointment } from "@/actions/appointments/delete";
import { z } from "zod";
import { Calendar, Client, Service } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type FormValues = z.infer<typeof createAppointmentSchema>;

interface ExtendedAppointmentFormProps extends AppointmentFormProps {
  clients: Client[];
  services: Service[];
  calendar: Calendar;
}

export function AppointmentForm({
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  initialStartTime,
  initialEndTime,
  calendarId,
  clients,
  services,
  calendar,
}: ExtendedAppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<
    number | null
  >(null);

  const isEditing = !!appointment;

  const calculateDefaultEndTime = (startTime: string): string => {
    return moment(startTime, "HH:mm").add(1, "hour").format("HH:mm");
  };

  const defaultStartTime = appointment
    ? moment(appointment.startTime).format("HH:mm")
    : initialStartTime ?? "09:00";

  const defaultEndTime = appointment
    ? moment(appointment.endTime).format("HH:mm")
    : initialEndTime ?? calculateDefaultEndTime(defaultStartTime);

  const form = useForm<FormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: appointment
      ? {
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          startTime: moment(appointment.startTime).format("HH:mm"),
          endTime: moment(appointment.endTime).format("HH:mm"),
          notes: appointment.notes || "",
          calendarId,
          servicePrice: appointment.servicePrice || null,
          finalPrice:
            appointment.finalPrice || appointment.servicePrice || null,
        }
      : {
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          notes: "",
          calendarId,
          servicePrice: null,
          finalPrice: null,
        },
  });

  const updatePriceFromService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      form.setValue("servicePrice", service.price);
      // Só atualiza o preço final se não estiver editando ou se o preço final for nulo
      if (!isEditing || !form.getValues("finalPrice")) {
        form.setValue("finalPrice", service.price);
      }
    }
  };

  // Atualiza o preço quando o serviço é selecionado
  useEffect(() => {
    const serviceId = form.watch("serviceId");
    if (serviceId) {
      updatePriceFromService(serviceId);
    }
  }, [form.watch("serviceId")]);

  // Atualiza a duração do serviço quando o serviço é selecionado
  useEffect(() => {
    const serviceId = form.watch("serviceId");
    const service = services.find((s) => s.id === serviceId);
    setSelectedServiceDuration(service?.durationMinutes ?? null);
  }, [form.watch("serviceId"), services]);

  // Atualiza o horário de término baseado na duração do serviço
  useEffect(() => {
    const startTime = form.watch("startTime");
    if (selectedServiceDuration && startTime) {
      const newEndTime = moment(startTime, "HH:mm")
        .add(selectedServiceDuration, "minutes")
        .format("HH:mm");
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceDuration, form.watch("startTime")]);

  // Reseta o formulário quando o appointment ou os tempos iniciais mudam
  useEffect(() => {
    form.reset({
      clientId: appointment?.clientId || "",
      serviceId: appointment?.serviceId || "",
      startTime: appointment?.startTime
        ? moment(appointment.startTime).format("HH:mm")
        : initialStartTime || "09:00",
      endTime: appointment?.endTime
        ? moment(appointment.endTime).format("HH:mm")
        : initialEndTime || "10:00",
      notes: appointment?.notes || "",
      calendarId,
      servicePrice: appointment?.servicePrice || null,
      finalPrice: appointment?.finalPrice || appointment?.servicePrice || null,
    });
  }, [
    appointment,
    appointment?.startTime,
    appointment?.endTime,
    initialStartTime,
    initialEndTime,
    calendarId,
  ]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!calendar.isActive) {
        toast.error(
          "Esta agenda está inativa e não permite novos agendamentos"
        );
        return;
      }

      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const [endHour, endMinute] = values.endTime.split(":").map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

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
        calendarId,
        startTime,
        endTime,
        notes: values.notes || null,
        status: "scheduled",
        servicePrice: values.servicePrice ?? null,
        finalPrice: values.finalPrice ?? null,
        collaboratorId: appointment?.collaboratorId || null,
      };

      let result;

      if (isEditing && appointment) {
        result = await updateAppointment(appointment.id!, {
          ...appointmentData,
          status: appointment.status || "scheduled",
        });
        if (!result.success) throw new Error(result.error);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        result = await createAppointment(appointmentData);
        if (!result.success) throw new Error(result.error);
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

  if (!calendar.isActive && !isEditing) {
    return (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agenda Inativa</DialogTitle>
            <DialogDescription>
              Esta agenda está temporariamente inativa e não está aceitando
              novos agendamentos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onSuccess}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDelete = async () => {
    if (!appointment?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteAppointment(appointment.id);
      if (!result.success) throw new Error(result.error);
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col justify-between h-full"
      >
        <div className="flex-1">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel></FormLabel>
                <SelectWithScroll
                  getOptionLabel={(option) => option?.fullName}
                  getOptionValue={(option) => option?.id}
                  label="Cliente"
                  placeholder="Selecione um cliente"
                  options={clients || []}
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.clientId?.message}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel></FormLabel>
                <SelectWithScroll
                  getOptionLabel={(option) => option?.name}
                  getOptionValue={(option) => option?.id}
                  label="Serviço"
                  placeholder="Selecione um serviço"
                  options={services}
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.clientId?.message}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="finalPrice"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    prefix="R$"
                    placeholder="R$ 0,00"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    allowNegative={false}
                    value={value}
                    onValueChange={(values) => {
                      onChange(values.floatValue);
                    }}
                  />
                </FormControl>
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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end w-full gap-2">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Cancelando..." : "Cancelar Agendamento"}
            </Button>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>Salvando...</>
            ) : (
              <>{isEditing ? "Atualizar" : "Agendar"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
