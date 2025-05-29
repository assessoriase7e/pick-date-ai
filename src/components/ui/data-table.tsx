"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  sortableColumns?: string[];
  headerContent?: React.ReactNode;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
  onSearch?: (value: string) => void;
}

export function DataTable<TData>({
  columns,
  data,
  sortableColumns = [],
  headerContent,
  enableSearch = true,
  searchPlaceholder = "Buscar...",
  pagination,
  onSearch,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Função para navegar entre páginas usando query params
  const navigateToPage = (pageNumber: number) => {
    if (!pagination) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Função para lidar com a mudança no campo de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilter(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="space-y-4 lg:block">
      <div className="flex items-center justify-between gap-2">
        {enableSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        )}
        {headerContent}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          sortableColumns.includes(header.column.id)
                            ? "cursor-pointer select-none"
                            : ""
                        }
                        onClick={
                          sortableColumns.includes(header.column.id)
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            Próxima <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
