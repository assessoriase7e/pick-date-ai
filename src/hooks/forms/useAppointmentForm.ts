"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments/update";
import { createAppointment } from "@/actions/appointments/create";
import { deleteAppointment } from "@/actions/appointments/delete";
import { createAppointmentSchema } from "@/validators/calendar";
import moment from "moment";
import { AppointmentFullData } from "@/types/calendar";
import { useAppointmentDataStore } from "@/store/appointment-data-store";
import { Service } from "@prisma/client";
import { daysMap } from "@/mocked/daysMap";

type FormValues = z.infer<typeof createAppointmentSchema>;

interface UseAppointmentFormProps {
  date: Date;
  appointment?: AppointmentFullData;
  onSuccess: () => void;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => boolean;
  calendarId: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export function useAppointmentForm({
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  calendarId,
  initialStartTime,
  initialEndTime,
}: UseAppointmentFormProps) {
  const {
    clients,
    services,
    isLoadingClients,
    isLoadingServices,
    fetchClients,
    fetchServices,
  } = useAppointmentDataStore();

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
        }
      : {
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          notes: "",
          calendarId,
        },
  });

  const isServiceAvailableOnDay = (service: Service): boolean => {
    if (!service.availableDays || service.availableDays.length === 0) {
      return true;
    }

    const dayOfWeek = moment(date).locale("pt-br").format("dddd");
    const dayName =
      daysMap[dayOfWeek] ||
      dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    return service.availableDays.includes(dayName);
  };

  useEffect(() => {
    fetchClients();
    fetchServices(calendarId);
  }, [calendarId]);

  useEffect(() => {
    const serviceId = form.watch("serviceId");
    const service = services.find((s) => s.id === serviceId);
    setSelectedServiceDuration(service?.durationMinutes ?? null);
  }, [form.watch("serviceId"), services]);

  useEffect(() => {
    const startTime = form.watch("startTime");
    if (selectedServiceDuration && startTime) {
      const newEndTime = moment(startTime, "HH:mm")
        .add(selectedServiceDuration, "minutes")
        .format("HH:mm");
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceDuration, form.watch("startTime")]);

  useEffect(() => {
    if (!isEditing) {
      const start = initialStartTime ?? "09:00";
      const end = initialEndTime ?? calculateDefaultEndTime(start);
      form.reset({
        startTime: start,
        endTime: end,
        notes: "",
        calendarId,
      });
    }
  }, [date, initialStartTime, initialEndTime, calendarId, isEditing]);

  const onSubmit = async (values: FormValues) => {
    try {
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

  return {
    form,
    clients: clients || [],
    services: services || [],
    isLoading,
    isDeleting,
    isLoadingClients,
    isLoadingServices,
    isEditing,
    isServiceAvailableOnDay,
    onSubmit,
    handleDelete,
  };
}
