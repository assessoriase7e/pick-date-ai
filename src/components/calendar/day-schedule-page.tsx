"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AppointmentFullData } from "@/types/calendar";
import { DayScheduleGrid } from "./day-schedule-grid";
import { AppointmentForm } from "../appointment/appointment-form";
import { toast } from "sonner";
import { Calendar, Client, Collaborator, Service } from "@prisma/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MobileDaySchedule } from "./mobile-day-schedule";

interface DayScheduleContentProps {
  calendarId: string;
  date: Date;
  appointments: AppointmentFullData[];
  collaborator: Collaborator;
  clients: Client[];
  services: Service[];
  calendar: Calendar;
}

export function DayScheduleContent({
  calendarId,
  date,
  collaborator,
  appointments,
  clients,
  services,
  calendar,
}: DayScheduleContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentFullData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const selectedHour = searchParams.get("hour")
    ? parseInt(searchParams.get("hour")!)
    : null;
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const formattedDate = moment(date).locale("pt-br").format("DD/MM/YYYY");

  useEffect(() => {
    if (selectedHour !== null || startTime || selectedAppointment) {
      setShowForm(true);
    }
  }, [selectedHour, startTime, selectedAppointment]);

  // Renderiza o componente mobile se estiver em um dispositivo móvel
  if (isMobile) {
    return (
      <MobileDaySchedule
        calendarId={calendarId}
        date={date}
        collaborator={collaborator}
        appointments={appointments}
        clients={clients}
        services={services}
        calendar={calendar}
      />
    );
  }

  // A partir daqui, apenas código para desktop
  const handleBackToCalendar = () => {
    router.push(`/calendar?calendarId=${calendarId}`);
  };

  const handleHourClick = (hour: number) => {
    const endHour = (hour + 1) % 24;

    const params = new URLSearchParams(searchParams.toString());
    params.set("hour", hour.toString());
    params.set("startTime", `${hour.toString().padStart(2, "0")}:00`);
    params.set("endTime", `${endHour.toString().padStart(2, "0")}:00`);

    setSelectedAppointment(null);

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("hour");
    params.delete("startTime");
    params.delete("endTime");

    setSelectedAppointment(appointment);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleFormSuccess = async () => {
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("hour");
      params.delete("startTime");
      params.delete("endTime");
      router.push(`${window.location.pathname}?${params.toString()}`);

      // Limpa o estado do formulário
      setShowForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Erro ao recarregar agendamentos:", error);
      toast.error("Erro ao atualizar a lista de agendamentos");
    }
  };

  const checkTimeConflict = (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): boolean => {
    return appointments.some((appointment) => {
      if (excludeId && appointment.id === excludeId) return false;
      if (appointment.status !== "scheduled") return false;

      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);

      return (
        (startTime < appointmentEnd && endTime > appointmentStart) ||
        (startTime.getTime() === appointmentStart.getTime() &&
          endTime.getTime() === appointmentEnd.getTime())
      );
    });
  };

  return (
    <div className="container mx-auto h-full flex flex-col items-end justify-center w-full gap-5">
      <div className="flex w-full">
        <Button
          variant="ghost"
          onClick={handleBackToCalendar}
          className="mr-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="grid grid-cols-1 gap-2 border border-primary rounded-xl p-4 px-5 bg-primary text-white">
          <h2 className="p-1 px-6 bg-foreground/25 rounded-lg ">
            {collaborator.name} | {collaborator.profession} | {formattedDate}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  w-full">
        <div className="border rounded-lg overflow-y-auto h-[calc(100svh-300px)]">
          <DayScheduleGrid
            appointments={appointments}
            onHourClick={handleHourClick}
            onEditAppointment={handleEditAppointment}
            selectedHour={selectedHour}
          />
        </div>

        <div className="border rounded-lg p-4">
          {showForm ? (
            <AppointmentForm
              date={date}
              appointment={selectedAppointment || undefined}
              onSuccess={handleFormSuccess}
              checkTimeConflict={checkTimeConflict}
              initialStartTime={startTime || undefined}
              initialEndTime={endTime || undefined}
              calendarId={calendarId}
              clients={clients}
              services={services}
              calendar={calendar}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-4">
                Selecione um horário na lista à esquerda para criar um novo
                agendamento ou clique em um agendamento existente para editá-lo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
