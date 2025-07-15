"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments/update";
import { createAppointment } from "@/actions/appointments/create";
import { deleteAppointment } from "@/actions/appointments/delete";
import { createAppointmentSchema } from "@/validators/calendar";
import moment from "moment";
import { AppointmentFullData } from "@/types/calendar";
import { useAppointmentDataStore } from "@/store/appointment-data-store";
import { Client, Service } from "@prisma/client";
import { daysMap } from "@/mocked/daysMap";
import { isCollaboratorAvailable } from "@/utils/checkCollaboratorAvailability";
import { CalendarWithFullCollaborator } from "@/types/calendar";
import { getClientCombos } from "@/actions/combos/get-client-combos";
import { ClientComboWithDetails } from "@/types/combo";
import { createComboAppointment } from "@/actions/appointments/create-combo-appointment";

type FormValues = z.infer<typeof createAppointmentSchema>;

interface UseAppointmentFormProps {
  date: Date;
  appointment?: AppointmentFullData;
  onSuccess: () => void;
  checkTimeConflict: (startTime: Date, endTime: Date, excludeId?: number) => boolean;
  calendar: CalendarWithFullCollaborator;
  initialStartTime?: string;
  initialEndTime?: string;
}

export function useAppointmentForm({
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  calendar,
  initialStartTime,
  initialEndTime,
  // Adicionar estes parâmetros
  clientsList,
  servicesList,
}: UseAppointmentFormProps & {
  clientsList?: Client[];
  servicesList?: Service[];
}) {
  // Usar os dados recebidos como props se disponíveis, caso contrário usar o store
  const {
    clients: storeClients,
    services: storeServices,
    isLoadingClients,
    isLoadingServices,
    fetchClients,
    fetchServices,
  } = useAppointmentDataStore();

  const clients = clientsList || storeClients;
  const services = servicesList || storeServices;

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>(appointment ? "resumo" : "editar");

  const isEditing = !!appointment;
  const calendarId = calendar.id;

  const calculateDefaultEndTime = (startTime: string): string => {
    return moment(startTime, "HH:mm").add(1, "hour").format("HH:mm");
  };

  const defaultStartTime = appointment ? moment(appointment.startTime).format("HH:mm") : initialStartTime ?? "09:00";

  const defaultEndTime = appointment
    ? moment(appointment.endTime).format("HH:mm")
    : initialEndTime ?? calculateDefaultEndTime(defaultStartTime);

  const form = useForm<FormValues & { newServiceId?: number }>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: appointment
      ? {
          clientId: appointment?.clientId || null,
          serviceId: appointment.serviceId,
          startTime: moment(appointment.startTime).format("HH:mm"),
          endTime: moment(appointment.endTime).format("HH:mm"),
          notes: appointment.notes || "",
          calendarId: calendar.id,
          servicePrice: appointment.servicePrice || null,
          finalPrice: appointment.finalPrice || appointment.servicePrice || null,
          collaboratorId: appointment.collaboratorId || calendar.collaboratorId,
        }
      : {
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          notes: "",
          calendarId: calendar.id,
          servicePrice: null,
          finalPrice: null,
          collaboratorId: calendar.collaboratorId,
        },
  });

  const updatePriceFromService = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      form.setValue("servicePrice", service.price);
      // Só atualiza o preço final se não estiver editando ou se o preço final for nulo
      if (!isEditing || !form.getValues("finalPrice")) {
        form.setValue("finalPrice", service.price);
      }
    }
  };

  const isServiceAvailableOnDay = (service: Service): boolean => {
    if (!service.availableDays || service.availableDays.length === 0) {
      return true;
    }

    const dayOfWeek = moment(date).locale("pt-br").format("dddd");
    const dayName = daysMap[dayOfWeek] || dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

    return service.availableDays.includes(dayName);
  };

  // Carrega clientes e serviços quando o componente é montado
  useEffect(() => {
    if (!clientsList) {
      fetchClients(calendarId);
    }
    if (!servicesList) {
      fetchServices(calendarId);
    }
  }, [calendarId, fetchClients, fetchServices, clientsList, servicesList]);

  // Atualiza a duração do serviço quando o serviço é selecionado
  useEffect(() => {
    const serviceId = form.watch("serviceId");
    const service = services.find((s) => s.id === serviceId);
    setSelectedServiceDuration(service?.durationMinutes ?? null);
  }, [form.watch("serviceId"), services]);

  // Atualiza o horário de término baseado na duração do serviço
  useEffect(() => {
    const startTime = form.watch("startTime");
    // Só atualiza automaticamente se NÃO estiver editando (ou seja, criando novo)
    if (!isEditing && selectedServiceDuration && startTime) {
      const newEndTime = moment(startTime, "HH:mm").add(selectedServiceDuration, "minutes").format("HH:mm");
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceDuration, form.watch("startTime"), isEditing]);

  // Reseta o formulário quando o appointment ou os tempos iniciais mudam
  useEffect(() => {
    form.reset({
      clientId: appointment?.clientId || null,
      serviceId: appointment?.serviceId || null,
      startTime: appointment?.startTime ? moment(appointment.startTime).format("HH:mm") : initialStartTime || "09:00",
      endTime: appointment?.endTime ? moment(appointment.endTime).format("HH:mm") : initialEndTime || "10:00",
      notes: appointment?.notes || "",
      calendarId: calendar.id || null,
      servicePrice: appointment?.servicePrice || null,
      finalPrice: appointment?.finalPrice || appointment?.servicePrice || null,
      collaboratorId: appointment?.collaboratorId || calendar.collaboratorId,
    });
  }, [appointment, initialStartTime, initialEndTime, calendar.id]);

  const [clientCombos, setClientCombos] = useState<ClientComboWithDetails[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<ClientComboWithDetails | null>(null);
  const [isUsingCombo, setIsUsingCombo] = useState(false);
  const [isLoadingCombos, setIsLoadingCombos] = useState(false);

  // Função para carregar os combos do cliente
  const loadClientCombos = async (clientId: number) => {
    if (!clientId) return;

    setIsLoadingCombos(true);
    try {
      const combos = await getClientCombos(clientId);
      // Filtrar apenas combos ativos e não expirados
      const activeCombos = combos.filter(
        (combo) => combo.status === "active" && (!combo.expiresAt || new Date(combo.expiresAt) > new Date())
      );
      setClientCombos(activeCombos);
    } catch (error) {
      console.error("Erro ao carregar combos do cliente:", error);
    } finally {
      setIsLoadingCombos(false);
    }
  };

  // Atualizar quando o cliente mudar
  useEffect(() => {
    const clientId = form.watch("clientId");
    if (clientId) {
      loadClientCombos(clientId);
    } else {
      setClientCombos([]);
      setSelectedCombo(null);
      setIsUsingCombo(false);
    }
  }, [form.watch("clientId")]);

  // Função para selecionar um combo
  const selectCombo = (combo: ClientComboWithDetails | null) => {
    setSelectedCombo(combo);

    if (combo) {
      setIsUsingCombo(true);
      // Resetar o serviço selecionado para que o usuário escolha um serviço do combo
      form.setValue("serviceId", null);
    } else {
      setIsUsingCombo(false);
    }
  };

  // Filtrar serviços disponíveis com base no combo selecionado
  const getAvailableServices = () => {
    if (!isUsingCombo || !selectedCombo) {
      return services.filter((service) => isServiceAvailableOnDay(service));
    }

    // Filtrar serviços que estão no combo e ainda têm sessões disponíveis
    // E também verificar se o serviço está associado ao colaborador do calendário
    return selectedCombo.sessions
      .filter(
        (session) =>
          session.usedSessions < session.totalSessions &&
          session.service &&
          isServiceAvailableOnDay(session.service) &&
          // Verificar se o serviço está associado ao colaborador do calendário
          session.service.serviceCollaborators?.some((sc) => sc.collaboratorId === calendar.collaboratorId)
      )
      .map((session) => session.service);
  };

  // Função para obter serviços disponíveis para um combo específico
  const getAvailableServicesForCombo = (comboId: number) => {
    // Encontrar o combo pelo ID
    const combo = clientCombos.find((c) => c.id === comboId);

    if (!combo) return [];

    // Filtrar serviços que estão no combo e ainda têm sessões disponíveis
    // E também verificar se o serviço está associado ao colaborador do calendário
    return combo.sessions
      .filter(
        (session) =>
          session.usedSessions < session.totalSessions &&
          session.service &&
          isServiceAvailableOnDay(session.service) &&
          // Verificar se o serviço está associado ao colaborador do calendário
          session.service.serviceCollaborators?.some((sc) => sc.collaboratorId === calendar.collaboratorId)
      )
      .map((session) => session.service);
  };

  // Modificar o onSubmit para usar o combo quando aplicável
  const onSubmit = async (values: FormValues & { newServiceId?: number }) => {
    try {
      if (!calendar?.isActive) {
        toast.error("Esta agenda está inativa e não permite novos agendamentos");
        return;
      }

      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const [endHour, endMinute] = values.endTime.split(":").map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      if (endTime <= startTime) {
        toast.error("O horário de término deve ser depois do horário de início");
        return;
      }

      // Verificar disponibilidade do colaborador
      const collaborator = calendar.collaborator;
      if (!isCollaboratorAvailable(collaborator, startTime, endTime)) {
        toast.error("Horário do profissional indisponível");
        return;
      }

      const hasConflict = checkTimeConflict(startTime, endTime, appointment?.id);
      if (hasConflict) {
        toast.error("Já existe um agendamento nesse horário");
        return;
      }

      setIsLoading(true);

      // Obter dados do serviço selecionado
      const selectedService = services.find((s) => s.id === values.serviceId);

      let result;

      if (isUsingCombo && selectedCombo) {
        // Encontrar a sessão correspondente ao serviço selecionado
        const comboSession = selectedCombo.sessions.find((s) => s.serviceId === values.serviceId);

        if (!comboSession) {
          toast.error("Serviço não encontrado no combo selecionado");
          return;
        }

        if (comboSession.usedSessions >= comboSession.totalSessions) {
          toast.error("Não há sessões disponíveis para este serviço no combo");
          return;
        }

        // Criar agendamento usando o combo
        result = await createComboAppointment({
          startTime,
          endTime,
          notes: values.notes || null,
          clientComboId: selectedCombo.id,
          serviceId: values.serviceId,
          calendarId: calendar.id,
          collaboratorId: calendar.collaboratorId,
        });

        if (!result.success) throw new Error(result.error);
        toast.success("Agendamento com combo criado com sucesso!");
      } else if (isEditing && appointment) {
        result = await updateAppointment(appointment.id!, {
          ...appointment,
          status: appointment.status || "scheduled",
        });
        if (!result.success) throw new Error(result.error);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        // Criar objeto com os dados do formulário
        const appointmentData = {
          clientId: values.clientId,
          serviceId: values.serviceId,
          calendarId: calendar.id,
          startTime,
          endTime,
          notes: values.notes || null,
          status: "scheduled",
          servicePrice: values.servicePrice,
          finalPrice: values.finalPrice,
          collaboratorId: values.collaboratorId || calendar.collaboratorId,
        };

        result = await createAppointment(appointmentData);
        if (!result.success) throw new Error(result.error);
        toast.success("Agendamento criado com sucesso!");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error("Ocorreu um erro ao salvar o agendamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteAppointment(appointment.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Agendamento excluído com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Ocorreu um erro ao excluir o agendamento");
    } finally {
      setIsDeleting(false);
    }
  };

  // Formata o preço para exibição
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Busca os dados do cliente e serviço para exibir no resumo
  const clientData = clients.find((c) => c.id === form.getValues("clientId"));
  const serviceData = services.find((s) => s.id === form.getValues("serviceId"));

  return {
    form,
    clients,
    services,
    isLoading,
    isDeleting,
    isLoadingClients,
    isLoadingServices,
    isEditing,
    isServiceAvailableOnDay,
    activeTab,
    setActiveTab,
    onSubmit,
    handleDelete,
    updatePriceFromService,
    formatCurrency,
    clientData,
    serviceData,
    selectedServiceDuration,
    // Novos retornos para combos
    clientCombos,
    selectedCombo,
    isUsingCombo,
    setIsUsingCombo,
    selectCombo,
    isLoadingCombos,
    getAvailableServices,
    getAvailableServicesForCombo, // Adicionando a nova função ao retorno
  };
}
