"use client";
import { FileRecord } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";

interface FilesDataTableProps {
  data: FileRecord[];
  columns: any[];
  totalPages?: number;
  currentPage?: number;
}

export function FilesDataTable({ data, columns, totalPages = 1, currentPage = 1 }: FilesDataTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      sortableColumns={["fileName", "fileType", "createdAt"]}
      searchPlaceholder="Buscar arquivos..."
      enableSearch={true}
      onSearch={() => {}}
      pagination={{
        totalPages,
        currentPage: currentPage,
      }}
    />
  );
}
