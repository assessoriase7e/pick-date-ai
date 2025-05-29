"use client";
import { useState, useEffect } from "react";
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
import IsTableLoading from "@/components/isTableLoading";
import { useIsMobile } from "@/hooks/use-is-mobile";

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
  setIsLoading?: (loading: boolean) => void;
  isloading?: boolean;
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
  isloading,
  setIsLoading,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Desativa o loading quando o componente é remontado (dados atualizados)
  useEffect(() => {
    if (isPageChanging) {
      setIsPageChanging(false);
    }
  }, [data]);

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

    // Ativa o loading antes de mudar de página
    setIsPageChanging(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Função para lidar com a mudança no campo de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilter(value);
    setIsSearching(true);

    if (onSearch) {
      onSearch(value);
    }
  };

  useEffect(() => {
    setIsSearching(false);
  }, [data]);

  // Renderiza os cards para visualização mobile
  const renderMobileCards = () => {
    if (table.getRowModel().rows?.length) {
      return (
        <div className="space-y-4">
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="p-4 rounded-md border bg-card shadow-sm"
            >
              {row.getVisibleCells().map((cell) => {
                // Obtém o cabeçalho da coluna para exibir junto com o valor
                const header = columns.find(
                  (col) => (col as any).id === cell.column.id
                )?.header as string;

                return (
                  <div key={cell.id} className="py-2 border-b last:border-0">
                    <div className="font-medium text-sm text-muted-foreground">
                      {header}
                    </div>
                    <div>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="text-center p-4 border rounded-md">
          Nenhum resultado encontrado.
        </div>
      );
    }
  };

  return (
    <div className="space-y-4 relative">
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

      <div className="relative">
        {/* Componente de loading */}
        <IsTableLoading
          isPageChanging={isPageChanging || isSearching || isloading}
        />

        {isMobile ? (
          // Visualização mobile (cards)
          renderMobileCards()
        ) : (
          // Visualização desktop (tabela)
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
        )}
      </div>

      {pagination && (
        <div className="flex items-center justify-end space-x-2 mx-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full lg:w-auto"
            onClick={() => navigateToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || isPageChanging}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
          <span className="text-sm w-full lg:w-auto text-center">
            {pagination.currentPage} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="w-full lg:w-auto"
            onClick={() => navigateToPage(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage >= pagination.totalPages || isPageChanging
            }
          >
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
