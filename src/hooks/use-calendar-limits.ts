"use client";

import { useSubscription } from "@/store/subscription-store";
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
  const { fetchSubscription } = useSubscription();
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
    if (user?.id) {
      fetchData();
      fetchSubscription();
    }
  }, [user?.id]);

  return {
    limit: data?.limit ?? 3,
    current: data?.current ?? 0,
    canCreateMore: data?.canCreateMore ?? true,
    isAiPlan: data?.isAiPlan ?? false,
    hasAdditionalCalendars: data?.hasAdditionalCalendars ?? false,
    isLoading,
    error,
    refresh: fetchData,
  };
}
