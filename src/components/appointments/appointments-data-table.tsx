"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { AppointmentDetails } from "./appointment-details";
import { SendNotificationModal } from "./send-notification-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AppointmentFullData } from "@/types/calendar";
import { Collaborator } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { Toggle } from "@/components/ui/toggle";
import { CalendarClock, History, MessageCircle, Printer } from "lucide-react";
import { checkConnectedInstances } from "@/actions/agents/evolution/check-connected-instances";
import { toast } from "sonner";
import { useBatchPrint } from "@/hooks/use-batch-print";
import { createColumns } from "./columns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";

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
  const { printSelectedAppointments, isPrinting } = useBatchPrint();

  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [showInstanceAlert, setShowInstanceAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para seleção múltipla
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Recuperar parâmetros da URL
  const initialSearch = searchParams.get("search") || "";
  const initialCollaborator = searchParams.get("collaborator") || "all";
  const initialTimeFilter = searchParams.get("timeFilter") || "past";

  // Estados locais
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [collaboratorFilter, setCollaboratorFilter] = useState(initialCollaborator);
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter);
  const [sorting, setSorting] = useState<SortingState>([{ id: "startTime", desc: timeFilter === "past" }]);

  // Função para lidar com seleção de itens
  const handleSelectionChange = (newSelectedIds: (string | number)[]) => {
    setSelectedIds(newSelectedIds.map((id) => Number(id)));
  };

  const clearSelections = () => {
    setSelectedIds([]);
  };

  const handlePrintSelected = async () => {
    if (selectedIds.length === 0) return;
    await printSelectedAppointments(selectedIds);
    clearSelections();
  };

  // Criar colunas com funcionalidade de seleção personalizada
  const columnsWithSelection = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedIds.length > 0 && selectedIds.length === appointments.length}
          onCheckedChange={(value) => {
            if (value) {
              setSelectedIds(appointments.map((a) => a.id));
            } else {
              setSelectedIds([]);
            }
          }}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => {
        const appointment = row.original;
        const isSelected = selectedIds.includes(appointment.id);

        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => {
              if (value) {
                setSelectedIds([...selectedIds, appointment.id]);
              } else {
                setSelectedIds(selectedIds.filter((id) => id !== appointment.id));
              }
            }}
            aria-label="Selecionar linha"
          />
        );
      },
    },
    ...createColumns(false), // Usar as colunas base sem a coluna de seleção
  ];

  // Efeito para desativar o loading quando o componente for recarregado
  useEffect(() => {
    setIsLoading(false);
  }, [appointments]);

  // Limpar seleções quando os dados mudarem
  useEffect(() => {
    setSelectedIds([]);
  }, [appointments]);

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

  // Função para verificar instância e abrir modal
  const handleNotificationClick = async () => {
    try {
      const result = await checkConnectedInstances();

      if (!result.success) {
        toast.error(result.error || "Erro ao verificar instâncias");
        return;
      }

      if (!result.hasConnectedInstance) {
        setShowInstanceAlert(true);
        return;
      }

      // Se há instância conectada, abrir o modal
      setIsNotificationModalOpen(true);
    } catch (error) {
      toast.error("Erro inesperado ao verificar instâncias");
    }
  };

  // Função para redirecionar para a página de agentes
  const handleGoToAgents = () => {
    setShowInstanceAlert(false);
    router.push("/agents");
  };

  // Função para atualizar os parâmetros da URL
  const updateUrlParams = (search: string, collaborator: string, timeFilter: string) => {
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
        const appointment = appointments.find((item) => item.id === Number(appointmentId));

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
      <div className="flex gap-2">
        {selectedIds.length > 0 && (
          <>
            <Button
              onClick={handlePrintSelected}
              disabled={isPrinting}
              className="flex items-center gap-2"
              variant="default"
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Gerando PDF..." : `Imprimir (${selectedIds.length})`}
            </Button>
          </>
        )}
        <Button onClick={handleNotificationClick} className="flex items-center gap-2" variant="outline">
          <MessageCircle className="h-4 w-4" />
          Emitir aviso
        </Button>
      </div>

      <Toggle
        pressed={timeFilter === "future"}
        onPressedChange={(pressed) => {
          const newTimeFilter = pressed ? "future" : "past";
          setTimeFilter(newTimeFilter);
          updateUrlParams(searchTerm, collaboratorFilter, newTimeFilter);
        }}
        className="gap-2 border border-border w-full h-9"
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

      <Select value={collaboratorFilter} onValueChange={handleCollaboratorChange}>
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
        columns={columnsWithSelection}
        data={appointments}
        sortableColumns={["client.fullName", "collaborator.name", "startTime"]}
        pagination={pagination}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por cliente, profissional ou serviço..."
        setIsLoading={setIsLoading}
        isloading={isLoading}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        getRowId={(row) => row.id}
        headerContent={headerContent}
      />

      <AppointmentDetails appointment={selectedAppointment} isOpen={isDetailsOpen} onClose={closeDetails} />

      <SendNotificationModal open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen} />

      {/* Alert Dialog para instância não conectada */}
      <AlertDialog open={showInstanceAlert} onOpenChange={setShowInstanceAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>WhatsApp não conectado</AlertDialogTitle>
            <AlertDialogDescription>
              Para enviar notificações via WhatsApp, você precisa ter uma instância conectada. Configure e conecte uma
              instância na seção "Agentes" antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInstanceAlert(false)}>Fechar</AlertDialogAction>
            <AlertDialogAction onClick={handleGoToAgents} className="bg-primary">
              Ir para Agentes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
