"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AppointmentFullData } from "@/types/calendar";
import { DayScheduleGrid } from "./day-schedule-grid";
import { AppointmentForm } from "../appointment/appointment-form";
import { toast } from "sonner";
import { Calendar, Client, Collaborator, Service } from "@prisma/client";
import { Separator } from "../ui/separator";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";

interface MobileDayScheduleProps {
  calendarId: string;
  date: Date;
  appointments: AppointmentFullData[];
  collaborator: Collaborator;
  clients: Client[];
  services: Service[];
  calendar: Calendar;
}

export function MobileDaySchedule({
  calendarId,
  date,
  collaborator,
  appointments,
  clients,
  services,
  calendar,
}: MobileDayScheduleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentFullData | null>(null);
  const [showForm, setShowForm] = useState(false);

  const selectedHour = searchParams.get("hour")
    ? parseInt(searchParams.get("hour")!)
    : null;
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const formattedDate = moment(date)
    .locale("pt-br")
    .format("DD [de] MMMM [de] YYYY");

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
    setShowForm(true);

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("hour");
    params.delete("startTime");
    params.delete("endTime");

    setSelectedAppointment(appointment);
    setShowForm(true);

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
    <div className="container mx-auto h-full flex flex-col items-center justify-center w-full gap-5">
      <Button
        variant="ghost"
        onClick={handleBackToCalendar}
        className="mr-auto"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="flex items-center flex-col">
        <h1 className="text-xl font-bold ml-auto text-center">
          Agendamentos para {formattedDate}
        </h1>
        <h2 className="p-1 px-6 bg-primary rounded-full text-white">
          {collaborator.name}
        </h2>
      </div>

      <Separator />

      <div className="w-full h-[calc(100svh-300px)]">
        <div className="border rounded-lg overflow-y-auto h-full">
          <DayScheduleGrid
            appointments={appointments}
            onHourClick={handleHourClick}
            onEditAppointment={handleEditAppointment}
            selectedHour={selectedHour}
          />
        </div>
      </div>

      {/* Drawer para o formulário de agendamento */}
      <Drawer open={showForm} onOpenChange={setShowForm}>
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
        </DrawerHeader>
        <DrawerContent>
          <div className="p-5">
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
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
