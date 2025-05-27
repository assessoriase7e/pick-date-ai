"use client";
import { FileRecord } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";

interface FilesDataTableProps {
  data: FileRecord[];
  columns: any[];
}

export function FilesDataTable({ data, columns }: FilesDataTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      sortableColumns={["fileName", "fileType", "createdAt"]}
      searchPlaceholder="Filtrar arquivos..."
      pageSize={10}
    />
  );
}
