import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  Row,
  flexRender,
} from "@tanstack/react-table";

import { useIsMobile, useTableQueryParams } from "./hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table-components";
import { TableHeader as DataTableHeader } from "./table-header";
import { TableFooter } from "./table-footer";
import { MobileCardView } from "./mobile-card-view";

// Interface para o componente DataTable reutilizável
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  filterColumn?: string;
  filterPlaceholder?: string;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialRowSelection?: RowSelectionState;
  emptyMessage?: string;
  className?: string;
  syncWithQueryParams?: boolean;
  selectedRowsRef?: React.MutableRefObject<Row<TData>[]>;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  createButton?: React.ReactNode;
  enableColumnFilter?: boolean;
  filterableColumns?: Array<{
    id: string;
    title: string;
    prismaField?: string; // Campo correspondente no Prisma
  }>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = true,
  filterColumn,
  filterPlaceholder = "Filtro...",
  onRowSelectionChange,
  onSortingChange,
  initialSorting = [],
  initialColumnVisibility = {},
  initialRowSelection = {},
  emptyMessage = "Sem resultados.",
  className,
  syncWithQueryParams = false,
  selectedRowsRef,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  createButton,
  enableColumnFilter = false,
  filterableColumns = [],
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();

  const {
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    searchValue,
    selectedFilterColumn,
    handleSearchChange,
    handleFilterColumnChange,
    handlePageChange: handlePageChangeInternal,
  } = useTableQueryParams({
    syncWithQueryParams,
    initialSorting,
    initialColumnVisibility,
    initialRowSelection,
    filterableColumns,
    enableColumnFilter,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);
      onRowSelectionChange?.(newRowSelection);
    },
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    state: {
      ...(enableSorting && { sorting }),
      ...(enableColumnVisibility && { columnVisibility }),
      ...(enableRowSelection && { rowSelection }),
    },
  });

  // Externalizar as linhas selecionadas através da ref
  React.useEffect(() => {
    if (selectedRowsRef) {
      selectedRowsRef.current = table.getFilteredSelectedRowModel().rows;
    }
  }, [table, rowSelection, selectedRowsRef]);

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      handlePageChangeInternal(newPage);
    }
  };

  return (
    <div className={`w-full space-y-4 ${className || ""}`}>
      {/* Header com filtros e controles */}
      <DataTableHeader
        enableFiltering={enableFiltering}
        enableColumnVisibility={enableColumnVisibility}
        enableColumnFilter={enableColumnFilter}
        filterPlaceholder={filterPlaceholder}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filterableColumns={filterableColumns}
        selectedFilterColumn={selectedFilterColumn}
        onFilterColumnChange={handleFilterColumnChange}
        createButton={createButton}
        syncWithQueryParams={syncWithQueryParams}
      />

      {/* Tabela para desktop ou Cards para mobile */}
      {isMobile ? (
        <MobileCardView
          rows={table.getRowModel().rows}
          enableRowSelection={enableRowSelection}
          emptyMessage={emptyMessage}
          table={table} // Passando a instância da tabela
          fileName={data[0] && (data[0] as any).fileName} // Adicionando o nome do arquivo se disponível
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer com seleção e paginação */}
      <TableFooter
        enableRowSelection={enableRowSelection}
        selectedRowsCount={table.getFilteredSelectedRowModel().rows.length}
        totalRowsCount={table.getFilteredRowModel().rows.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
