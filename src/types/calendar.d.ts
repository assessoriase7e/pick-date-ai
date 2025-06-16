"use server";

import { Appointment, Calendar, Client, Collaborator, Service, WorkHour } from "@prisma/client";

export type AppointmentData = Omit<Appointment, "id" | "createdAt" | "updatedAt"> & {
  status?: string;
};

export type AppointmentFullData = Appointment & {
  client: Client | null;
  service: Service | null;
  collaborator: Collaborator | null;
};

export type FullCollaborator = Collaborator & {
  workHours: WorkHour[];
};

export type CalendarWithFullCollaborator = Calendar & {
  collaborator: FUllCollaborator | null;
};

export type CalendarFullData = CalendarWithCollaborator & {
  appointments: AppointmentFullData[];
};

export type CalendarDay = {
  date: moment.Moment;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export interface CalendarViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  calendarDays: CalendarDay[];
  calendarId: string;
  initialAppointments: Record<string, AppointmentFullData[]>;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  handleDayClick: (date: Date) => void;
  isSelected: (day: moment.Moment) => boolean;
  getAppointmentsForDay: (day: moment.Moment) => AppointmentFullData[];
  formatMonth: (date: Date) => string;
}
