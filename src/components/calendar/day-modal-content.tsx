"use client";
import { AppointmentFullData, CalendarWithFullCollaborator } from "@/types/calendar";
import { DayScheduleGrid } from "./day-schedule-grid";
import { AppointmentForm } from "../appointment/appointment-form";
import { MobileDaySchedule } from "./mobile/mobile-day-schedule";
import { Client, Collaborator, Service } from "@prisma/client";

interface DayModalContentProps {
  isMobile: boolean;
  date: Date;
  calendarId: number;
  collaborator: Collaborator | null;
  appointments: AppointmentFullData[];
  clients: Client[];
  services: Service[];
  calendar: CalendarWithFullCollaborator;
  showForm: boolean;
  selectedHour: number | null;
  selectedAppointment: AppointmentFullData | null;
  startTime: string | null;
  endTime: string | null;
  onHourClick: (hour: number) => void;
  onEditAppointment: (appointment: AppointmentFullData) => void;
  onFormSuccess: () => void;
  checkTimeConflict: (startTime: Date, endTime: Date, excludeId?: number) => boolean;
}

export function DayModalContent({
  isMobile,
  date,
  calendarId,
  collaborator,
  appointments,
  clients,
  services,
  calendar,
  showForm,
  selectedHour,
  selectedAppointment,
  startTime,
  endTime,
  onHourClick,
  onEditAppointment,
  onFormSuccess,
  checkTimeConflict,
}: DayModalContentProps) {
  return (
    <div className="h-full flex flex-col">
      {isMobile ? (
        <div className="flex-1 overflow-hidden">
          <MobileDaySchedule
            calendarId={calendarId}
            date={date}
            collaborator={collaborator}
            appointments={appointments}
            clients={clients}
            services={services}
            calendar={calendar}
          />
        </div>
      ) : (
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="h-[78svh] overflow-y-auto">
                <DayScheduleGrid
                  appointments={appointments}
                  onHourClick={onHourClick}
                  onEditAppointment={onEditAppointment}
                  selectedHour={selectedHour}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              {showForm ? (
                <AppointmentForm
                  date={date}
                  appointment={selectedAppointment || undefined}
                  onSuccess={onFormSuccess}
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
                    Selecione um horário na lista à esquerda para criar um novo agendamento ou clique em um agendamento
                    existente para editá-lo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}