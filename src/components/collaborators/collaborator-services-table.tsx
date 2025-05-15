"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { AppointmentFullData } from "@/types/calendar";
import { formatCurrency } from "@/lib/format-utils";
import { Calendar, ScissorsSquare, User } from "lucide-react";

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

  return (
    <>
      <div className="space-y-4">
        {/* Visualização Desktop */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment: AppointmentFullData) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {appointment.service?.name || "Serviço não encontrado"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        appointment.finalPrice || appointment.service.price
                      ) || "Serviço não encontrado"}
                    </TableCell>
                    <TableCell>{formatDate(appointment.startTime)}</TableCell>
                    <TableCell>{appointment.client?.fullName}</TableCell>
                    <TableCell>
                      {appointment.startTime && appointment.endTime
                        ? `${formatTime(appointment.startTime)} - ${formatTime(
                            appointment.endTime
                          )}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger>
                            {truncateText(appointment.notes || "-")}
                          </TooltipTrigger>
                          <TooltipContent className="w-44">
                            <p>{appointment.notes || "-"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
                      {formatCurrency(appointment.service?.price) ||
                        "Serviço não encontrado"}
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

      <div className="mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
