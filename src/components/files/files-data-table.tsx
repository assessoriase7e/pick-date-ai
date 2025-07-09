"use client";

import { FileRecord } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FilesDataTableProps {
  data: FileRecord[];
  columns: ColumnDef<FileRecord>[];
  totalPages: number;
  currentPage: number;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  onCreateClick?: () => void;
}

export function FilesDataTable({
  data,
  columns,
  totalPages,
  currentPage,
  onSelectionChange,
  onCreateClick,
}: FilesDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedRowsRef = useRef<any[]>([]);

  // Função para lidar com a mudança de seleção de linhas
  const handleRowSelectionChange = (selection: Record<string, boolean>) => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(selection).filter((id) => selection[id]);
      onSelectionChange(selectedIds);
    }
  };

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Botão de criação que será passado para o DataTable
  const createButton = onCreateClick ? (
    <Button onClick={onCreateClick}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Arquivo
    </Button>
  ) : undefined;

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting={true}
      enableFiltering={true}
      filterPlaceholder="Buscar arquivos..."
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      initialSorting={[{ id: "createdAt", desc: true }]}
      emptyMessage="Nenhum arquivo encontrado."
      syncWithQueryParams={true}
      selectedRowsRef={selectedRowsRef}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      createButton={createButton}
    />
  );
}
