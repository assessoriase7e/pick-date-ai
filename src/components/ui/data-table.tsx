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
  RowSelectionState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  // Novas props para seleção
  enableSelection?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  getRowId?: (row: TData) => string | number;
  // Novas props para ordenação
  initialSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
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
  enableSelection = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  initialSorting = [],
  onSortingChange,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Sincronizar rowSelection com selectedIds
  useEffect(() => {
    if (enableSelection && getRowId) {
      const newRowSelection: RowSelectionState = {};
      // Usar um Set para melhorar a performance da busca
      const selectedIdsSet = new Set(selectedIds.map((id) => String(id)));

      // Atribuir diretamente os índices das linhas que correspondem aos IDs selecionados
      data.forEach((row, index) => {
        const rowId = String(getRowId(row));
        if (selectedIdsSet.has(rowId)) {
          newRowSelection[index] = true;
        }
      });

      setRowSelection(newRowSelection);
    }
  }, [selectedIds, data, enableSelection, getRowId]);

  // Desativa o loading quando o componente é remontado (dados atualizados)
  useEffect(() => {
    if (isPageChanging) {
      setIsPageChanging(false);
    }
  }, [data]);

  // Modificar o hook useEffect para chamar onSortingChange quando o sorting mudar
  useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      if (!enableSelection) return;

      const newRowSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);

      if (onSelectionChange && getRowId) {
        // Extrair os IDs das linhas selecionadas
        const newSelectedIds = Object.keys(newRowSelection)
          .filter((key) => newRowSelection[key])
          .map((key) => {
            const rowIndex = parseInt(key);
            const row = data[rowIndex];
            return row ? getRowId(row) : null;
          })
          .filter((id) => id !== null);

        // Garantir que o callback seja chamado com os IDs corretos
        onSelectionChange(newSelectedIds);
      }
    },
    state: {
      globalFilter,
      sorting,
      ...(enableSelection && { rowSelection }),
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true, // Sempre habilitar seleção de linha
    enableMultiRowSelection: true, // Esta linha permite seleção múltipla
    getRowId: getRowId
      ? (row, index) => {
          if (!row) return index.toString();
          const id = getRowId(row);
          return id ? id.toString() : index.toString();
        }
      : (row, index) => index.toString(), // Fallback para usar índice
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
            <div key={row.id} className="p-4 rounded-md border bg-card shadow-sm">
              {row.getVisibleCells().map((cell) => {
                // Obtém o cabeçalho da coluna para exibir junto com o valor
                const header = columns.find((col) => (col as any).id === cell.column.id)?.header as string;

                return (
                  <div key={cell.id} className="py-2 border-b last:border-0">
                    <div className="font-medium text-sm text-muted-foreground">{header}</div>
                    <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    } else {
      return <div className="text-center p-4 border rounded-md">Nenhum resultado encontrado.</div>;
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 w-full">
        {enableSearch && (
          <div className="relative flex-1 w-full">
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
        <IsTableLoading isPageChanging={isPageChanging || isSearching || isloading} />

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
                            className={sortableColumns.includes(header.column.id) ? "cursor-pointer select-none" : ""}
                            onClick={
                              sortableColumns.includes(header.column.id)
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    // Forçar a avaliação do estado de seleção como booleano
                    const isSelected = row.getIsSelected() === true;
                    return (
                      <TableRow
                        key={row.id}
                        data-state={isSelected ? "selected" : undefined}
                        // Adicionar classe personalizada para debug
                        className={isSelected ? "bg-muted" : ""}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
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
            disabled={pagination.currentPage >= pagination.totalPages || isPageChanging}
          >
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
