import { create } from "zustand";
import { getClients } from "@/actions/clients/get-clients";
import { Client, Service } from "@prisma/client";
import { getCalendarCollaborator } from "@/actions/calendars/get-calendar-collaborator";
import { getServicesByCollaborator } from "@/actions/services/get-services-by-collaborator";

interface AppointmentDataState {
  clients: Client[];
  services: Service[];
  isLoadingClients: boolean;
  isLoadingServices: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  fetchServices: (calendarId?: string) => Promise<void>;
  reset: () => void;
}

export const useAppointmentDataStore = create<AppointmentDataState>((set) => ({
  clients: [],
  services: [],
  isLoadingClients: false,
  isLoadingServices: false,
  error: null,

  fetchClients: async () => {
    set({ isLoadingClients: true, error: null });
    try {
      const response = await getClients({ limit: 1000, page: 1 });

      if (response.success && response.data) {
        set({ clients: response.data, isLoadingClients: false });
      } else {
        set({
          error: "Erro ao carregar clientes",
          isLoadingClients: false,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      set({
        error: "Falha ao carregar clientes",
        isLoadingClients: false,
      });
    }
  },

  fetchServices: async (calendarId) => {
    set({ isLoadingServices: true, error: null });
    try {
      if (!calendarId) return;
      const { data: collab } = await getCalendarCollaborator(calendarId);

      if (!collab?.collaboratorId) {
        set({
          error: "Profissional não encontrado para este calendário",
          isLoadingServices: false,
        });
        return;
      }

      const response = await getServicesByCollaborator(collab.collaboratorId);

      if (response.success && response.data) {
        set({ services: response.data, isLoadingServices: false });
      } else {
        set({
          error: "Erro ao carregar serviços",
          isLoadingServices: false,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      set({
        error: "Falha ao carregar serviços",
        isLoadingServices: false,
      });
    }
  },

  reset: () => {
    set({
      clients: [],
      services: [],
      isLoadingClients: false,
      isLoadingServices: false,
      error: null,
    });
  },
}));
