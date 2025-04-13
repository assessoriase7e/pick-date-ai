"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProfessionals(page = 1, limit = 10) {
  const { data, error, isLoading, mutate } = useSWR(`/api/professionals?page=${page}&limit=${limit}`, fetcher)

  return {
    professionals: data?.professionals || [],
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: error,
    mutate,
  }
}
