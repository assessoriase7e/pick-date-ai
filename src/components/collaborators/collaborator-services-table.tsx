"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { AppointmentFullData } from "@/types/calendar";

interface CollaboratorServicesTableProps {
  data: any[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function CollaboratorServicesTable({
  data,
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

  return (
    <>
      <div className="space-y-4">
        {/* Visualização Desktop */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.map((appointment: AppointmentFullData) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.service?.name || 'Serviço não encontrado'}</TableCell>
                    <TableCell>{formatDate(appointment.startTime)}</TableCell>
                    <TableCell>
                      {appointment.startTime && appointment.endTime
                        ? `${formatTime(appointment.startTime)} - ${formatTime(
                            appointment.endTime
                          )}`
                        : "-"}
                    </TableCell>
                    <TableCell>{appointment.notes || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Visualização Mobile */}
        <div className="md:hidden space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground rounded-md border">
              Nenhum serviço encontrado
            </div>
          ) : (
            data.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-md border p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{appointment.service?.name || 'Serviço não encontrado'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(appointment.date)}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
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
