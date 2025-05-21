"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AppointmentDetails } from "./appointment-details";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentFullData } from "@/types/calendar";
import { Collaborator } from "@prisma/client";
import { AppointmentsMobileView } from "./AppointmentsMobileView";
import { DataTable } from "@/components/ui/data-table";
import { Toggle } from "@/components/ui/toggle";
import { CalendarClock, History } from "lucide-react";

interface AppointmentsDataTableProps {
  columns: ColumnDef<any>[];
  appointments: AppointmentFullData[];
  collaborators: Collaborator[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function AppointmentsDataTable({
  columns,
  appointments,
  collaborators,
  pagination,
}: AppointmentsDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Recuperar parâmetros da URL
  const initialSearch = searchParams.get("search") || "";
  const initialCollaborator = searchParams.get("collaborator") || "all";
  const initialTimeFilter = searchParams.get("timeFilter") || "past";

  // Estados locais
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [collaboratorFilter, setCollaboratorFilter] =
    useState(initialCollaborator);
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startTime", desc: timeFilter === "past" },
  ]);

  // Atualizar a URL quando os filtros mudarem
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    if (collaboratorFilter !== "all") {
      params.set("collaborator", collaboratorFilter);
    }

    if (timeFilter !== "past") {
      params.set("timeFilter", timeFilter);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchTerm, collaboratorFilter, timeFilter]);

  const handleCollaboratorChange = (value: string) => {
    setCollaboratorFilter(value);
  };

  const handleDetailsClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedAppointment(null);
  };

  // Efeito para adicionar event listeners aos botões de resumo
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button[data-appointment-id]");

      if (button) {
        const appointmentId = button.getAttribute("data-appointment-id");
        const appointment = appointments.find(
          (item) => item.id === appointmentId
        );

        if (appointment) {
          handleDetailsClick(appointment);
        }
      }
    };

    document.addEventListener("click", handleButtonClick);

    return () => {
      document.removeEventListener("click", handleButtonClick);
    };
  }, [appointments]);

  useEffect(() => {
    setSorting([{ id: "startTime", desc: timeFilter === "past" }]);
  }, [timeFilter]);

  const headerContent = (
    <div className="flex flex-col lg:flex-row gap-2 w-full md:w-auto">
      <Toggle
        pressed={timeFilter === "future"}
        onPressedChange={(pressed) =>
          setTimeFilter(pressed ? "future" : "past")
        }
        className="gap-2 border border-border w-full"
      >
        {timeFilter === "future" ? (
          <>
            <CalendarClock className="h-4 w-4" />
            Futuros
          </>
        ) : (
          <>
            <History className="h-4 w-4" />
            Passados
          </>
        )}
      </Toggle>

      <Select
        value={collaboratorFilter}
        onValueChange={handleCollaboratorChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filtrar por profissional" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Profissional</SelectItem>
          {collaborators.map((collaborator) => (
            <SelectItem key={collaborator.id} value={collaborator.id}>
              {collaborator.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      {isMobile ? (
        <AppointmentsMobileView
          appointments={appointments}
          onDetailsClick={handleDetailsClick}
        />
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          sortableColumns={[
            "client.fullName",
            "collaborator.name",
            "startTime",
          ]}
          headerContent={headerContent}
          enableSearch={true}
          searchPlaceholder="Buscar agendamentos..."
          pageSize={50}
          enablePagination={false}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {pagination.currentPage} de {pagination.totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const prevPage = Math.max(1, pagination.currentPage - 1);
              const params = new URLSearchParams(searchParams.toString());
              if (prevPage > 1) {
                params.set("page", String(prevPage));
              } else {
                params.delete("page");
              }
              router.push(`?${params.toString()}`);
            }}
            disabled={pagination.currentPage <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextPage = Math.min(
                pagination.totalPages,
                pagination.currentPage + 1
              );
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(nextPage));
              router.push(`?${params.toString()}`);
            }}
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>

      <AppointmentDetails
        appointment={selectedAppointment}
        isOpen={isDetailsOpen}
        onClose={closeDetails}
      />
    </div>
  );
}
