"use server";
import { listCalendars } from "@/actions/calendars/getMany";
import { CalendarContent } from "../../../components/calendar/calendar-content";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { AppointmentFullData } from "@/types/calendar";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";
import moment from "moment";
import { getClientsByCalendar } from "@/actions/clients/get-clients-by-calendar";
import { getServicesByCalendar } from "@/actions/services/get-services-by-calendar";
import { getCalendarCollaborator } from "@/actions/calendars/get-calendar-collaborator";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    calendarId?: string;
    date?: string;
    selectedDay?: string;
  }>;
}) {
  const sParams = await searchParams;

  const [response, collaboratorsResponse] = await Promise.all([listCalendars(), getCollaborators({ limit: 100 })]);

  const calendars = response.success && response.data ? response.data : [];
  const collaborators = collaboratorsResponse.success ? collaboratorsResponse.data : [];

  const initialCalendarId = calendars.length > 0 ? calendars[0].id : 0;
  const requestedCalendarId = Number(sParams.calendarId);

  // Verificar se o calendário solicitado existe
  const calendarExists = requestedCalendarId && calendars.some((cal) => cal.id === requestedCalendarId);
  const calendarId = calendarExists ? requestedCalendarId : initialCalendarId;

  const currentDate = sParams.date ? moment(sParams.date).toDate() : moment().startOf("day").toDate();

  const appointmentsByDate: Record<string, AppointmentFullData[]> = {};
  const res = await getAppointmentsByMonth(currentDate, Number(calendarId));

  if (res?.success && res?.data) {
    res.data.forEach((appointment: any) => {
      if (appointment.status === "canceled") {
        return;
      }

      const dateKey = moment(appointment.startTime).format("YYYY-MM-DD");

      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = [];
      }

      appointmentsByDate[dateKey].push(appointment as AppointmentFullData);
    });
  }

  let selectedDayAppointments: AppointmentFullData[] = [];
  let selectedDayDate: Date | null = null;

  if (sParams.selectedDay) {
    selectedDayDate = moment(sParams.selectedDay).toDate();
    const dayResponse = await getAppointmentsByCalendarAndDate(calendarId, selectedDayDate);

    if (dayResponse.success && dayResponse.data) {
      selectedDayAppointments = dayResponse.data.filter((appointment) => appointment.status !== "canceled");
    }
  }

  // Antes do return, adicione:
  const allClients: Record<number, any[]> = {};
  const allServices: Record<number, any[]> = {};
  const allCollaborators: Record<number, any> = {};

  // Carregar dados para todos os calendários
  for (const calendar of calendars) {
    const [clientsRes, servicesRes, collaboratorRes] = await Promise.all([
      getClientsByCalendar(calendar.id),
      getServicesByCalendar(calendar.id),
      getCalendarCollaborator(calendar.id),
    ]);

    allClients[calendar.id] = clientsRes.success ? clientsRes.data : [];
    allServices[calendar.id] = servicesRes.success ? servicesRes.data : [];
    allCollaborators[calendar.id] = collaboratorRes.success ? collaboratorRes.data?.collaborator || null : null;
  }

  return (
    <CalendarContent
      calendars={calendars}
      calendarId={calendarId}
      appointments={appointmentsByDate}
      currentDate={currentDate}
      selectedDay={selectedDayDate}
      selectedDayAppointments={selectedDayAppointments}
      collaborators={collaborators}
      allClients={allClients}
      allServices={allServices}
      allCollaborators={allCollaborators}
    />
  );
}
