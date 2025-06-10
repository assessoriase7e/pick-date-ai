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
  collaborator?: {
    id: number;
    name: string;
    profession: string;
  } | null;
  servicePrice?: number;
}

type ClientServiceWithRelations = ClientService;

interface ClientServicesTableProps {
  clientServices: ClientServiceWithRelations[];
  services: Service[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
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

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const columns: ColumnDef<ClientServiceWithRelations>[] = [
    {
      accessorKey: "service.name",
      header: "Serviço",
    },
    {
      accessorKey: "collaborator.name",
      header: "Profissional",
      cell: ({ row }) => {
        const collaborator = row.original.collaborator;
        return collaborator ? collaborator.name : "-";
      },
    },
    {
      accessorKey: "servicePrice",
      header: "Preço",
      cell: ({ row }) => {
        const price = row.original.servicePrice || row.original.service.price;
        return formatCurrency(price);
      },
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
        enableSearch={true}
        pagination={{
          totalPages: pagination.pages,
          currentPage: pagination.currentPage,
        }}
      />
    </>
  );
}
