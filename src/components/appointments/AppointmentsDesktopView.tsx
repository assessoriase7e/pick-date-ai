"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Appointment } from "@prisma/client";

interface AppointmentsDesktopViewProps {
  columns: ColumnDef<Appointment>[];
  data: Appointment[];
  headerContent?: React.ReactNode;
}

export function AppointmentsDesktopView({
  columns,
  data,
  headerContent,
}: AppointmentsDesktopViewProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      sortableColumns={["client.fullName", "collaborator.name", "startTime"]}
      headerContent={headerContent}
      enableSearch={true}
      searchPlaceholder="Buscar agendamentos..."
      pageSize={50}
      enablePagination={false}
    />
  );
}
