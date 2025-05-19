"use client";

import { AppointmentFullData } from "@/types/calendar";
import { formatCurrency } from "@/lib/format-utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Calendar, ScissorsSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface CollaboratorServicesTableProps {
  appointments: AppointmentFullData[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function CollaboratorServicesTable({
  appointments,
  pagination,
}: CollaboratorServicesTableProps) {
  const router = useRouter();

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

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

  const truncateText = (text: string, wordLimit: number = 5) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const columns: ColumnDef<AppointmentFullData>[] = [
    {
      accessorKey: "service.name",
      header: "Serviço",
      cell: ({ row }) => row.original.service?.name || "Serviço não encontrado",
    },
    {
      accessorKey: "finalPrice",
      header: "Preço",
      cell: ({ row }) =>
        formatCurrency(row.original.finalPrice || row.original.service.price),
    },
    {
      accessorKey: "startTime",
      header: "Data",
      cell: ({ row }) => formatDate(row.original.startTime),
    },
    {
      accessorKey: "client.fullName",
      header: "Cliente",
      cell: ({ row }) => row.original.client?.fullName,
    },
    {
      accessorKey: "time",
      header: "Horário",
      cell: ({ row }) =>
        row.original.startTime && row.original.endTime
          ? `${formatTime(row.original.startTime)} - ${formatTime(
              row.original.endTime
            )}`
          : "-",
    },
    {
      accessorKey: "notes",
      header: "Descrição",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              {truncateText(row.original.notes || "-")}
            </TooltipTrigger>
            <TooltipContent className="w-44">
              <p>{row.original.notes || "-"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={appointments}
        sortableColumns={["service.name", "startTime", "client.fullName"]}
        pageSize={10}
        enablePagination={true}
        searchPlaceholder="Buscar serviços..."
      />

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">
            Nenhum serviço encontrado
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-md border p-4 space-y-3"
            >
              <div className="grid grid-cols-2">
                <div className="space-y-1">
                  <h3 className="font-medium flex gap-2">
                    <ScissorsSquare />
                    {appointment.service?.name || "Serviço não encontrado"}
                  </h3>
                  <p className="text-sm text-muted-foreground flex gap-2">
                    <Calendar /> {formatDate(appointment.startTime)}
                  </p>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.notes}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium flex gap-2">
                    {formatCurrency(
                      appointment.finalPrice || appointment.service.price
                    ) || "Serviço não encontrado"}
                  </h3>
                  <p className="text-sm text-muted-foreground flex gap-2">
                    <User /> {appointment.client?.fullName}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {appointment.notes || "Nenhuma observação"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
