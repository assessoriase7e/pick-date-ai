"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Service } from "@prisma/client";

interface ClientService {
  id: number;
  clientId: number;
  serviceId: number;
  date: Date;
  service: Service;
  isAppointment?: boolean;
  startTime?: Date;
  endTime?: Date;
  description?: string;
  status?: string;
}

type ClientServiceWithRelations = ClientService;

interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
}

interface ClientServicesTableProps {
  clientServices: ClientServiceWithRelations[];
  services: Service[];
  pagination: Pagination;
}

export default function ClientServicesTable({
  clientServices,
  pagination,
}: ClientServicesTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: ColumnDef<ClientServiceWithRelations>[] = [
    {
      accessorKey: "service.name",
      header: "Serviço",
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "time",
      header: "Horário",
      cell: ({ row }) => {
        const service = row.original;
        return service.isAppointment && service.startTime && service.endTime
          ? `${formatTime(service.startTime)} - ${formatTime(service.endTime)}`
          : "-";
      },
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => row.original.description || "-",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={clientServices}
        sortableColumns={["service.name", "date"]}
        searchPlaceholder="Buscar serviços..."
        pageSize={pagination.total}
        enablePagination={false}
      />
    </>
  );
}
