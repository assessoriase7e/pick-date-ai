import { useSubscription } from "./use-subscription";
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
  
  const { data, error, mutate } = useSWR<CalendarLimitsData>(
    '/api/calendar/limits',
    fetcher,
    {
      refreshInterval: 30000, // 30 segundos
      revalidateOnFocus: false,
    }
  );

  const getCalendarLimit = (): number => {
    if (!subscription || !isSubscriptionActive) {
      return 3; // Plano base
    }

    const { stripePriceId } = subscription;
    
    // Planos com IA não têm limite
    if ([
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
    ].includes(stripePriceId)) {
      return Infinity;
    }
    
    // Verificar se tem assinatura de calendários adicionais
    if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!) {
      return 13; // 3 base + 10 adicionais
    }
    
    return 3;
  };

  return {
    limit: data?.limit ?? getCalendarLimit(),
    current: data?.current ?? 0,
    canCreateMore: data?.canCreateMore ?? true,
    isAiPlan: data?.isAiPlan ?? false,
    hasAdditionalCalendars: data?.hasAdditionalCalendars ?? false,
    isLoading: !error && !data,
    error,
    refresh: mutate,
  };
}