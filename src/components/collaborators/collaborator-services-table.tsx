"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { AppointmentFullData } from "@/types/calendar";

interface CollaboratorServicesTableProps {
  appointments: AppointmentFullData[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function CollaboratorServicesTable({ appointments, pagination }: CollaboratorServicesTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatTime = (date: Date) => {
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

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      confirmed: "Confirmado",
      completed: "Concluído",
      canceled: "Cancelado",
      pending: "Pendente",
    };
    return statusMap[status] || status;
  };

  const columns: ColumnDef<AppointmentFullData>[] = [
    {
      accessorKey: "client.name",
      header: "Cliente",
      cell: ({ row }) => row.original.client?.fullName || "-",
    },
    {
      accessorKey: "service.name",
      header: "Serviço",
      cell: ({ row }) => row.original.service?.name || "-",
    },
    {
      accessorKey: "service.price",
      header: "Valor",
      cell: ({ row }) => formatCurrency(row.original.service?.price),
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => formatDate(row.original.startTime),
    },
    {
      accessorKey: "time",
      header: "Horário",
      cell: ({ row }) => {
        return `${formatTime(row.original.startTime)} - ${formatTime(row.original.endTime)}`;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => formatStatus(row.original.status),
    },
    {
      accessorKey: "notes",
      header: "Observações",
      cell: ({ row }) => row.original.notes || "-",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={appointments}
      enableSorting={true}
      enableFiltering={true}
      filterPlaceholder="Buscar serviços..."
      totalPages={pagination.totalPages}
      currentPage={pagination.currentPage}
      emptyMessage="Nenhum serviço encontrado para este colaborador."
    />
  );
}
