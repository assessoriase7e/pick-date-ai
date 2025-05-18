"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isSameDay, isAfter } from "date-fns";
import { AppointmentFullData } from "@/types/calendar";

export const columns: ColumnDef<AppointmentFullData>[] = [
  {
    accessorKey: "client.fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const client = row.original.client;
      return (
        <div className="font-medium">
          {client?.fullName || "Cliente Deletado"}
        </div>
      );
    },
  },
  {
    accessorKey: "collaborator.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Profissional
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.collaborator.name}</div>;
    },
  },
  {
    accessorKey: "service.name",
    header: "Serviço",
    cell: ({ row }) => {
      return <div>{row.original.service.name}</div>;
    },
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startTime = new Date(row.getValue("startTime") as string);
      return (
        <div>
          {format(startTime, "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const startTime = new Date(row.getValue("startTime") as string);
      const today = new Date();

      let status: "hoje" | "futuro" | "realizado";
      let label: string;

      if (isSameDay(startTime, today)) {
        status = "hoje";
        label = "Hoje";
      } else if (isAfter(startTime, today)) {
        status = "futuro";
        label = "Futuro";
      } else {
        status = "realizado";
        label = "Realizado";
      }

      return (
        <Badge
          variant="outline"
          className={
            status === "hoje"
              ? "bg-primary text-primary-foreground"
              : status === "futuro"
              ? "bg-yellow-500 text-white"
              : "bg-green-500 text-white"
          }
        >
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          data-appointment-id={appointment.id}
        >
          <Info className="h-4 w-4" />
          Resumo
        </Button>
      );
    },
  },
];
