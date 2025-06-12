"use server";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import { getCalendarCollaborator } from "@/actions/calendars/get-calendar-collaborator";
import { DayScheduleContent } from "@/components/calendar/day-schedule-page";
import { getClients } from "@/actions/clients/get-clients";
import moment from "moment";
import { getServicesByCalendar } from "@/actions/services/get-services-by-calendar";
import { getCalendarById } from "@/actions/calendars/getById";

export default async function DaySchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    calendarId?: string;
    date?: string;
  }>;
}) {
  const sParams = await searchParams;

  if (!sParams.calendarId || !sParams.date) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Parâmetros inválidos. Volte para o calendário e selecione uma data.
        </p>
      </div>
    );
  }

  const calendarId = Number(sParams.calendarId);
  const date = moment(sParams.date).toDate();

  // Buscar dados em paralelo para melhor performance
  const [
    appointmentsResponse,
    collaboratorResponse,
    clientsResponse,
    servicesResponse,
    getCalendarByIdResponse,
  ] = await Promise.all([
    getAppointmentsByCalendarAndDate(calendarId, date),
    getCalendarCollaborator(calendarId),
    getClients(),
    getServicesByCalendar(calendarId),
    getCalendarById(calendarId),
  ]);

  const allAppointments =
    appointmentsResponse.success && appointmentsResponse.data
      ? appointmentsResponse.data
      : [];

  const appointments = allAppointments.filter(
    (appointment) => appointment.status !== "canceled"
  );

  const clients =
    clientsResponse.success && clientsResponse.data ? clientsResponse.data : [];
  const services =
    servicesResponse.success && servicesResponse.data
      ? servicesResponse.data
      : [];

  // Verificar se o calendário e colaborador existem
  if (!getCalendarByIdResponse.success || !getCalendarByIdResponse.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Calendário não encontrado.
        </p>
      </div>
    );
  }

  if (!collaboratorResponse.success || !collaboratorResponse.data?.collaborator) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Este calendário não possui um colaborador associado. Configure um colaborador antes de criar agendamentos.
        </p>
      </div>
    );
  }

  return (
    <DayScheduleContent
      calendarId={calendarId}
      date={date}
      appointments={appointments}
      collaborator={collaboratorResponse.data.collaborator}
      clients={clients}
      services={services}
      calendar={getCalendarByIdResponse.data}
    />
  );
}
