import moment from "moment";
import { AppointmentFullData } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { hoursOfDay } from "@/mocked/hoursOfDay";
import { useState } from "react";
import { PublicAppointmentDetailsModal } from "./public-appointment-details-modal";
import { PublicAppointmentCard } from "./public-appointment-card";
import { Client, Service } from "@prisma/client";

interface PublicDayScheduleGridProps {
  appointments: AppointmentFullData[];
  onHourClick: (hour: number) => void;
  selectedHour: number | null;
  selectedDate: string;
  calendarId: string;
  services: Service[];
  clients: Client[];
  collaboratorId: string;
}

export function PublicDayScheduleGrid({
  appointments,
  onHourClick,
  selectedHour,
  selectedDate,
  calendarId,
  services,
  clients,
  collaboratorId,
}: PublicDayScheduleGridProps) {
  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== "canceled"
  );

  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  const isNightHour = (hour: number) => {
    return hour >= 22 || hour <= 5;
  };

  const getAppointmentsForHour = (hour: number) => {
    const result = activeAppointments.filter((appointment) => {
      const appointmentStart = moment(appointment.startTime);
      const appointmentEnd = moment(appointment.endTime);
      const currentHourStart = moment(selectedDate)
        .hour(hour)
        .minute(0)
        .second(0);
      const currentHourEnd = moment(selectedDate)
        .hour(hour)
        .minute(59)
        .second(59);

      return (
        appointmentStart.isSameOrBefore(currentHourEnd) &&
        appointmentEnd.isAfter(currentHourStart)
      );
    });
    return result;
  };

  const isHourOccupied = (hour: number) => {
    return getAppointmentsForHour(hour).length > 0;
  };

  const handleHourClick = (hour: number) => {
    // Remover a condição para permitir cliques em todos os slots
    onHourClick(hour);
  };

  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentFullData | null>(null);

  const handleAppointmentClick = (appointment: AppointmentFullData) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full">
        {/* Régua de horas */}
        <div className="w-16 flex-shrink-0 border-r bg-muted/20">
          {hoursOfDay.map((hour) => (
            <div
              key={hour}
              className={cn(
                "h-20 flex items-center justify-center border-b",
                isNightHour(hour) &&
                  "bg-background brightness-90 dark:brightness-50"
              )}
            >
              <span className="text-sm font-medium">{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        {/* Área de conteúdo para horários */}
        <div className="flex-1 relative">
          <div className="grid grid-rows-[repeat(24,80px)]">
            {hoursOfDay.map((hour) => {
              const hourAppointments = getAppointmentsForHour(hour);
              const isOccupied = hourAppointments.length > 0;

              return (
                <div
                  key={hour}
                  className={cn(
                    "h-20 border-b transition-colors cursor-pointer",
                    isNightHour(hour) &&
                      "bg-background brightness-90 dark:brightness-50",
                    !isOccupied && "hover:bg-muted/20",
                    isOccupied && "bg-muted/10 hover:bg-muted/20",
                    selectedHour === hour && "ring-2 ring-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHourClick(hour);
                  }}
                >
                  {isOccupied ? (
                    <div className="h-full">
                      {hourAppointments.map((appointment, index) => {
                        const start = moment(appointment.startTime);
                        const end = moment(appointment.endTime);
                        const durationMinutes = end.diff(start, "minutes");
                        const height = (durationMinutes / 60) * 80;

                        return (
                          <PublicAppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onClick={handleAppointmentClick}
                            height={height}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Horário Disponível
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Modal de detalhes do agendamento */}
      <PublicAppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={handleCloseModal}
        calendarId={calendarId}
        services={services}
        clients={clients}
        collaboratorId={collaboratorId}
      />
    </div>
  );
}
