import { create } from "zustand";
import { getClientsByCalendar } from "@/actions/clients/get-clients-by-calendar";
import { getServicesByCalendar } from "@/actions/services/get-services-by-calendar";
import { Client, Service } from "@prisma/client";

interface AppointmentDataState {
  clients: Client[];
  services: Service[];
  isLoadingClients: boolean;
  isLoadingServices: boolean;
  error: string | null;
  fetchClients: (calendarId: number) => Promise<void>;
  fetchServices: (calendarId: number) => Promise<void>;
  reset: () => void;
}

export const useAppointmentDataStore = create<AppointmentDataState>((set) => ({
  clients: [],
  services: [],
  isLoadingClients: false,
  isLoadingServices: false,
  error: null,

  fetchClients: async (calendarId: number) => {
    set({ isLoadingClients: true, error: null });
    try {
      const response = await getClientsByCalendar(calendarId);

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

  fetchServices: async (calendarId: number) => {
    set({ isLoadingServices: true, error: null });
    try {
      const response = await getServicesByCalendar(calendarId);

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
