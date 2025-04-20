"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAudios(page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/audios?page=${page}&limit=${limit}`,
    fetcher
  );

  return {
    audios: data?.audios || [],
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: error,
    mutate,
  };
}