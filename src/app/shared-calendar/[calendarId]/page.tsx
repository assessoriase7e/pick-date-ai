"use server";

import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { AppointmentFullData } from "@/types/calendar";
import { SharedCalendarView } from "@/components/public-calendar/shared-calendar-view";
import { notFound } from "next/navigation";
import { getCalendarById } from "@/actions/calendars/getById";
import { getServicesByUserId } from "@/actions/services/get-by-user-id";
import { getClientsByCalendar } from "@/actions/clients/get-clients-by-calendar";

export default async function SharedCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ calendarId: string }>;
  searchParams: Promise<{
    date?: string;
    selectedDay?: string;
  }>;
}) {
  const sParams = await searchParams;
  const { calendarId } = await params;

  const calendarResponse = await getCalendarById(calendarId, false);

  if (!calendarResponse.success || !calendarResponse.data) {
    return notFound();
  }

  const calendar = calendarResponse.data;

  // Buscar clientes do calendário
  const clientsResponse = await getClientsByCalendar(calendarId);
  const clients = clientsResponse.success ? clientsResponse.data || [] : [];

  // Buscar serviços do usuário dono do calendário
  const servicesResponse = await getServicesByUserId(calendar.userId, {
    serviceCollaborators: {
      some: { collaboratorId: calendar.collaboratorId! },
    },
  });
  const services = servicesResponse.success ? servicesResponse.data || [] : [];

  const currentDate = sParams.date ? new Date(sParams.date) : new Date();

  const appointmentsByDate: Record<string, AppointmentFullData[]> = {};
  const res = await getAppointmentsByMonth(currentDate, calendarId, false);

  if (res?.success && res?.data) {
    res.data.forEach((appointment: AppointmentFullData) => {
      if (!appointment.client || !appointment.service) {
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

  let selectedDayDate: Date | null = null;

  if (sParams.selectedDay) {
    selectedDayDate = new Date(sParams.selectedDay);
  }

  return (
    <SharedCalendarView
      calendar={calendar}
      currentDate={currentDate}
      initialAppointments={appointmentsByDate}
      selectedDay={selectedDayDate}
      services={services}
      clients={clients}
    />
  );
}
