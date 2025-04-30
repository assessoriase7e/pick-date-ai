"use server";
import { listCalendars } from "@/actions/calendars/getMany";
import { CalendarContent } from "../../../components/calendar/calendar-content";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { AppointmentFullData } from "@/types/calendar";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ calendarId: string }>;
}) {
  const response = await listCalendars();
  const calendars = response.success && response.data ? response.data : [];
  const initialActiveTab = calendars.length > 0 ? calendars[0].id : "";
  const { calendarId } = (await searchParams) || initialActiveTab;

  const currentDate = new Date();
  const appointmentsByDate: Record<string, AppointmentFullData[]> = {};

  const res = await getAppointmentsByMonth(currentDate, calendarId);

  if (res?.success && res?.data) {
    res.data.forEach((appointment: any) => {
      if (!appointment.client || !appointment.service) {
        console.warn(
          "Appointment missing client or service data:",
          appointment.id
        );
        return;
      }

      const dateKey = new Date(appointment.startTime)
        .toISOString()
        .split("T")[0];

      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = [];
      }

      appointmentsByDate[dateKey].push(appointment as AppointmentFullData);
    });
  }

  return (
    <CalendarContent
      initialCalendars={calendars}
      initialActiveTab={initialActiveTab}
      initialAppointments={appointmentsByDate}
      initialDate={currentDate}
    />
  );
}
