import { Suspense } from "react";
import {
  getAppointments,
  getCollaborators,
} from "@/actions/appointments/getMany";
import { AppointmentsDataTable } from "@/components/appointments/appointments-data-table";
import { columns } from "@/components/appointments/columns";
import { LoaderCircle } from "lucide-react";
import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";

interface AppointmentsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    collaborator?: string;
    timeFilter?: string;
  }>;
}

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const sParams = await searchParams;
  const page = Number(sParams.page || "1");
  const search = sParams.search || "";
  const collaborator = sParams.collaborator || "all";
  const timeFilter = sParams.timeFilter || "past";
  const limit = 10;

  // Buscar dados
  const [appointmentsResult, collaboratorsResult] = await Promise.all([
    getAppointments(
      page,
      limit,
      collaborator !== "all" ? collaborator : undefined,
      search,
      {
        endTime:
          timeFilter === "past"
            ? { lte: moment().startOf("day").add(1, "day").toISOString() }
            : { gte: moment().startOf("day").toISOString() },
      }
    ),
    getCollaborators(),
  ]);

  // Preparar dados para a tabela
  const appointments = appointmentsResult.success
    ? appointmentsResult.data!.appointments
    : [];

  const pagination = appointmentsResult.success
    ? appointmentsResult.data!.pagination
    : { totalPages: 1, currentPage: 1 };

  const collaborators = collaboratorsResult.success
    ? collaboratorsResult.data
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os agendamentos do sistema.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <LoaderCircle className="animate-spin h-8 w-8" />
          </div>
        }
      >
        <AppointmentsDataTable
          columns={columns}
          appointments={appointments as any as AppointmentFullData[]}
          collaborators={collaborators || []}
          pagination={pagination}
        />
      </Suspense>
    </div>
  );
}
