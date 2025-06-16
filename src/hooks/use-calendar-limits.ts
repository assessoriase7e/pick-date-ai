import { isLifetimeUser } from "@/lib/lifetime-user";
import { useSubscription } from "./use-subscription";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";

interface CalendarLimitsData {
  limit: number;
  current: number;
  canCreateMore: boolean;
  isAiPlan: boolean;
  hasAdditionalCalendars: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCalendarLimits() {
  const { subscription, isSubscriptionActive } = useSubscription();
  const { user } = useUser();

  const { data, error, mutate } = useSWR<CalendarLimitsData>("/api/calendar/limits", fetcher, {
    refreshInterval: 30000, // 30 segundos
    revalidateOnFocus: false,
  });

  // Remover a função getCalendarLimit local e usar apenas os dados da API
  // pois a verificação lifetime agora é feita no servidor

  return {
    limit: data?.limit ?? 3, // fallback para plano base
    current: data?.current ?? 0,
    canCreateMore: data?.canCreateMore ?? true,
    isAiPlan: data?.isAiPlan ?? false, // fallback para false
    hasAdditionalCalendars: data?.hasAdditionalCalendars ?? false, // fallback para false
    isLoading: !error && !data,
    error,
    refresh: mutate,
  };
}
