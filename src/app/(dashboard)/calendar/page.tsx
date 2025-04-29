"use server";
import { listCalendars } from "@/actions/calendars/getMany";
import { CalendarContent } from "../../../components/calendar/calendar-content";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { addMonths, subMonths } from "date-fns";
import { AppointmentFullData } from "@/types/calendar";

export default async function CalendarPage() {
  const response = await listCalendars();
  const calendars = response.success && response.data ? response.data : [];
  const initialActiveTab = calendars.length > 0 ? calendars[0].id : "";

  // Carrega os agendamentos para o mês atual, anterior e próximo
  const currentDate = new Date();
  const prevMonth = subMonths(currentDate, 1);
  const nextMonth = addMonths(currentDate, 1);

  const [
    currentMonthAppointments,
    prevMonthAppointments,
    nextMonthAppointments,
  ] = await Promise.all([
    getAppointmentsByMonth(currentDate),
    getAppointmentsByMonth(prevMonth),
    getAppointmentsByMonth(nextMonth),
  ]);

  const appointmentsByDate: Record<string, AppointmentFullData[]> = {};

  const addAppointmentsToMap = (appointmentsResponse: any) => {
    if (appointmentsResponse?.success && appointmentsResponse?.data) {
      appointmentsResponse.data.forEach((appointment: any) => {
        const dateKey = new Date(appointment.startTime)
          .toISOString()
          .split("T")[0];
        if (!appointmentsByDate[dateKey]) {
          appointmentsByDate[dateKey] = [];
        }

        // Ensure appointment has client and service properties
        if (!appointment.client || !appointment.service) {
          console.warn(
            "Appointment missing client or service data:",
            appointment.id
          );
          return; // Skip this appointment
        }

        appointmentsByDate[dateKey].push(appointment as AppointmentFullData);
      });
    }
  };

  addAppointmentsToMap(currentMonthAppointments);
  addAppointmentsToMap(prevMonthAppointments);
  addAppointmentsToMap(nextMonthAppointments);

  return (
    <CalendarContent
      initialCalendars={calendars}
      initialActiveTab={initialActiveTab}
      initialAppointments={appointmentsByDate}
      initialDate={currentDate}
    />
  );
}
