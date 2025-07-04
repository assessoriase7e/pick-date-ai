import { useSubscription } from "./use-subscription";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { getCalendarLimits } from "@/actions/calendars/get-calendar-limits";

interface CalendarLimitsData {
  limit: number;
  current: number;
  canCreateMore: boolean;
  isAiPlan: boolean;
  hasAdditionalCalendars: boolean;
}

export function useCalendarLimits() {
  const { subscription } = useSubscription();
  const { user } = useUser();
  const [data, setData] = useState<CalendarLimitsData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const limits = await getCalendarLimits();
      setData(limits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Configurar um intervalo para atualizar os dados a cada 30 segundos
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [user?.id, subscription?.id]);

  return {
    limit: data?.limit ?? 3, // fallback para plano base
    current: data?.current ?? 0,
    canCreateMore: data?.canCreateMore ?? true,
    isAiPlan: data?.isAiPlan ?? false, // fallback para false
    hasAdditionalCalendars: data?.hasAdditionalCalendars ?? false, // fallback para false
    isLoading,
    error,
    refresh: fetchData,
  };
}
