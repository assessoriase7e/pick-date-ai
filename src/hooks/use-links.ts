import { useState, useEffect } from "react";
import { listLinks } from "@/actions/links/getMany";

export function useLinks(page: number, limit: number = 10) {
  const [links, setLinks] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchLinks() {
    setIsLoading(true);
    const result = await listLinks(page, limit);
    
    if (result.success) {
      setLinks(result.data.links);
      setTotalPages(result.data.totalPages);
    }
    
    setIsLoading(false);
  }

  useEffect(() => {
    fetchLinks();
  }, [page, limit]);

  return {
    links,
    totalPages,
    isLoading,
    mutate: fetchLinks,
  };
}