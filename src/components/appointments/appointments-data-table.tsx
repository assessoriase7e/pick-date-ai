"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef, SortingState } from "@tanstack/react-table";
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

  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Efeito para desativar o loading quando o componente for recarregado
  useEffect(() => {
    setIsLoading(false);
  }, [appointments]);

  // Efeito para ativar o loading quando houver sorting
  useEffect(() => {
    if (sorting.length > 0) {
      setIsLoading(true);
    }
  }, [sorting]);

  const handleCollaboratorChange = (value: string) => {
    setCollaboratorFilter(value);
    updateUrlParams(searchTerm, value, timeFilter);
  };

  const handleDetailsClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedAppointment(null);
  };

  // Função para atualizar os parâmetros da URL
  const updateUrlParams = (
    search: string,
    collaborator: string,
    timeFilter: string
  ) => {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (collaborator !== "all") {
      params.set("collaborator", collaborator);
    }

    if (timeFilter !== "past") {
      params.set("timeFilter", timeFilter);
    }

    const page = searchParams.get("page");
    if (page && page !== "1") {
      params.set("page", page);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  // Função para lidar com a busca
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateUrlParams(value, collaboratorFilter, timeFilter);
  };

  // Efeito para adicionar event listeners aos botões de resumo
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button[data-appointment-id]");

      if (button) {
        const appointmentId = button.getAttribute("data-appointment-id");
        const appointment = appointments.find(
          (item) => item.id === Number(appointmentId)
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
        onPressedChange={(pressed) => {
          const newTimeFilter = pressed ? "future" : "past";
          setTimeFilter(newTimeFilter);
          updateUrlParams(searchTerm, collaboratorFilter, newTimeFilter);
        }}
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
            <SelectItem key={collaborator.id} value={String(collaborator.id)}>
              {collaborator.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={appointments}
        sortableColumns={["client.fullName", "collaborator.name", "startTime"]}
        headerContent={headerContent}
        enableSearch={true}
        searchPlaceholder="Buscar agendamentos..."
        pagination={pagination}
        onSearch={handleSearch}
        isloading={isLoading}
        setIsLoading={setIsLoading}
      />

      <AppointmentDetails
        appointment={selectedAppointment}
        isOpen={isDetailsOpen}
        onClose={closeDetails}
      />
    </div>
  );
}
