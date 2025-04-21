"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useImages(page = 1, limit = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/images?page=${page}&limit=${limit}`,
    fetcher
  );

  return {
    images: data?.images || [],
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: error,
    mutate,
  };
}
