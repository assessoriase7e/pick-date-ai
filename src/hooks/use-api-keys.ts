import useSWR from "swr";
import { ApiKey } from "@prisma/client";

interface ApiKeysResponse {
  apiKeys: ApiKey[];
  totalPages: number;
  currentPage: number;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        try {
          const errorBody = JSON.parse(text);
          throw new Error(
            errorBody.message || `Erro ${res.status}: ${res.statusText}`
          );
        } catch (e) {
          throw new Error(
            `Erro ${res.status}: ${res.statusText || "Falha ao buscar dados"}`
          );
        }
      });
    }
    return res.json();
  });

export function useApiKeys(page: number = 1) {
  const { data, error, isLoading, mutate } = useSWR<ApiKeysResponse>(
    `/api/api-keys?page=${page}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      refreshInterval: 0,
    }
  );

  return {
    apiKeys: data?.apiKeys,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.currentPage ?? page,
    isLoading,
    isError: error,
    mutate,
  };
}
