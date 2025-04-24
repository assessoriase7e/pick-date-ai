"use client";

import { useState, useEffect } from "react";
import { listPrompts } from "@/actions/prompts/getMany";

export function usePrompts(page: number, limit: number) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchPrompts() {
    setIsLoading(true);
    const result = await listPrompts(page, limit);

    if (result.success && result?.data) {
      setPrompts(result.data.prompts);
      setTotalPages(result.data.totalPages);
    } else {
      console.error("Erro ao buscar prompts:", result.error);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    fetchPrompts();
  }, [page, limit]);

  return {
    prompts,
    totalPages,
    isLoading,
    mutate: fetchPrompts,
  };
}
