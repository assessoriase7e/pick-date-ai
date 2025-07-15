"use server";
import { listCalendars } from "@/actions/calendars/getMany";

import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { AppointmentFullData } from "@/types/calendar";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";
import moment from "moment";
import { getClientsByCalendar } from "@/actions/clients/get-clients-by-calendar";
import { getServicesByCalendar } from "@/actions/services/get-services-by-calendar";
import { getCalendarCollaborator } from "@/actions/calendars/get-calendar-collaborator";
import { checkExcessCalendars } from "@/actions/calendars/check-excess-calendars";
import { redirect } from "next/navigation";
import { YearCalendar } from "@/components/calendar/year-view/year-calendar";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    calendarId?: string;
    date?: string;
    collaboratorId?: string;
  }>;
}) {
  // Verificar se há excesso de calendários e redirecionar para a página de gerenciamento
  const excessData = await checkExcessCalendars();
  if (excessData.hasExcess) {
    redirect("/manage-calendars");
  }

  const sParams = await searchParams;
  console.log(sParams.calendarId);

  // Buscar calendários e colaboradores
  const [response, collaboratorsResponse] = await Promise.all([listCalendars(), getCollaborators({ limit: 100 })]);

  const calendars = response.success && response.data ? response.data : [];
  const collaborators = collaboratorsResponse.success ? collaboratorsResponse.data : [];

  // Determinar o collaboratorId a ser usado
  let collaboratorId: number | undefined;

  if (sParams.collaboratorId) {
    // Se houver um collaboratorId nas query params, use-o
    collaboratorId = Number(sParams.collaboratorId);
  } else if (collaborators.length > 0) {
    // Se não houver collaboratorId nas query params, use o primeiro colaborador da lista
    collaboratorId = collaborators[0].id;

    // Se não houver calendarId nas query params, redirecione para a URL com o primeiro colaborador
    if (!sParams.calendarId) {
      const params = new URLSearchParams();
      params.set("collaboratorId", String(collaboratorId));

      // Encontrar o calendário associado ao colaborador padrão
      const collaboratorCalendar = calendars.find((cal) => cal.collaboratorId === collaboratorId);

      // Se encontrar um calendário para o colaborador, incluir seu ID na URL
      if (collaboratorCalendar) {
        params.set("calendarId", String(collaboratorCalendar.id));
      }

      // Manter a data atual se existir
      if (sParams.date) {
        params.set("date", sParams.date);
      }

      // Redirecionar para a URL com o collaboratorId e calendarId
      redirect(`/calendar?${params.toString()}`);
    }
  }

  const initialCalendarId = calendars.length > 0 ? calendars[0].id : 0;
  const requestedCalendarId = Number(sParams.calendarId);

  // Verificar se o calendário solicitado existe
  const calendarExists = requestedCalendarId && calendars.some((cal) => cal.id === requestedCalendarId);
  const calendarId = calendarExists ? requestedCalendarId : initialCalendarId;

  const currentDate = sParams.date ? moment(sParams.date).toDate() : moment().startOf("day").toDate();

  // Função para carregar agendamentos de um mês específico
  const loadAppointmentsForMonth = async (date: Date) => {
    const res = await getAppointmentsByMonth(date, Number(calendarId), true, false, {
      status: "scheduled",
      // Adicionar filtro por collaboratorId se estiver definido
      ...(collaboratorId
        ? {
            calendar: {
              collaboratorId: collaboratorId,
            },
          }
        : {}),
    });
    return res?.success && res?.data ? res.data : [];
  };

  // Carregar agendamentos para todos os meses do ano
  const appointmentPromises = [];
  for (let month = 0; month < 12; month++) {
    const monthDate = moment(currentDate).month(month).date(1).toDate();
    appointmentPromises.push(loadAppointmentsForMonth(monthDate));
  }

  const allMonthsAppointments = await Promise.all(appointmentPromises);

  // Organizar agendamentos por data
  const appointmentsByDate: Record<string, AppointmentFullData[]> = {};
  allMonthsAppointments.flat().forEach((appointment: any) => {
    if (appointment.status === "canceled") return;

    const dateKey = moment(appointment.startTime).format("YYYY-MM-DD");
    if (!appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey] = [];
    }
    appointmentsByDate[dateKey].push(appointment as AppointmentFullData);
  });

  // Carregar dados para todos os calendários
  const allClients: Record<number, any[]> = {};
  const allServices: Record<number, any[]> = {};
  const allCollaborators: Record<number, any> = {};

  const [clientsRes, servicesRes] = await Promise.all([
    getClientsByCalendar(calendarId),
    getServicesByCalendar(calendarId),
    getCalendarCollaborator(calendarId),
  ]);

  allClients[calendarId] = clientsRes.success ? clientsRes.data : [];
  allServices[calendarId] = servicesRes.success ? servicesRes.data : [];

  console.log(allServices);

  return (
    <YearCalendar
      calendars={calendars}
      calendarId={calendarId}
      appointments={appointmentsByDate}
      currentDate={currentDate}
      collaborators={collaborators}
      allClients={allClients}
      allServices={allServices}
      allCollaborators={allCollaborators}
    />
  );
}
