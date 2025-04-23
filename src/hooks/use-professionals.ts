"use client";

import { useState, useEffect } from "react";
import { getAllProfessionals } from "@/actions/professionals/getAllProfessionals";

export function useProfessionals() {
  const [data, setData] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfessionals() {
      try {
        setIsLoading(true);
        const result = await getAllProfessionals();
        if (result.success) {
          setData(result.data);
        } else {
          setError("Failed to load professionals");
        }
      } catch (err) {
        setError("An error occurred while fetching professionals");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfessionals();
  }, []);

  return { data, isLoading, error };
}