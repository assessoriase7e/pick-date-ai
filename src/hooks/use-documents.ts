"use client";

import { useState, useEffect } from "react";
import { listDocuments } from "@/actions/documents/getMany";

export function useDocuments(page: number, limit: number) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchDocuments() {
    setIsLoading(true);
    const result = await listDocuments(page, limit);
    
    if (result.success) {
      setDocuments(result.data.documents);
      setTotalPages(result.data.totalPages);
    } else {
      console.error("Error fetching documents:", result.error);
    }
    
    setIsLoading(false);
  }

  useEffect(() => {
    fetchDocuments();
  }, [page, limit]);

  return {
    documents,
    totalPages,
    isLoading,
    mutate: fetchDocuments
  };
}