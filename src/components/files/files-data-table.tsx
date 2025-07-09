"use client";

import { FileRecord } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilesDataTableProps {
  data: FileRecord[];
  columns: ColumnDef<FileRecord>[];
  totalPages: number;
  currentPage: number;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

export function FilesDataTable({ data, columns, totalPages, currentPage, onSelectionChange }: FilesDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useCallback(
    (searchTerm: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }

      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      sortableColumns={["fileName", "fileType", "createdAt"]}
      searchPlaceholder="Buscar arquivos..."
      enableSearch={true}
      onSearch={handleSearch}
      pagination={{
        totalPages,
        currentPage,
      }}
      enableSelection={true}
      onSelectionChange={onSelectionChange}
      getRowId={(row) => row.id.toString()}
    />
  );
}
