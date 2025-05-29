"use client";
import { FileRecord } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { useState, useCallback } from "react";
import { listFiles } from "@/actions/files/getMany";
import { toast } from "sonner";

interface FilesDataTableProps {
  data: FileRecord[];
  columns: any[];
  totalPages?: number;
  currentPage?: number;
}

export function FilesDataTable({ 
  data: initialData, 
  columns, 
  totalPages = 1, 
  currentPage = 1 
}: FilesDataTableProps) {
  const [data, setData] = useState(initialData);
  const [pages, setPages] = useState(totalPages);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const result = await listFiles(currentPage, 10, searchTerm);
      
      if (result.success) {
        setData(result.data.files);
        setPages(result.data.totalPages);
      } else {
        toast.error("Erro ao buscar arquivos");
      }
    } catch (error) {
      console.error("Error searching files:", error);
      toast.error("Erro ao buscar arquivos");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  return (
    <DataTable
      columns={columns}
      data={data}
      sortableColumns={["fileName", "fileType", "createdAt"]}
      searchPlaceholder="Buscar arquivos..."
      enableSearch={true}
      onSearch={handleSearch}
      pagination={{
        totalPages: pages,
        currentPage: currentPage
      }}
    />
  );
}
