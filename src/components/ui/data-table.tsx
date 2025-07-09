"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  Row,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./button";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

// Componentes Table básicos
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={`w-full caption-bottom text-sm ${className || ""}`} {...props} />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={`[&_tr]:border-b ${className || ""}`} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className || ""}`} {...props} />
  )
);
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ""}`}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${
        className || ""
      }`}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ""}`} {...props} />
  )
);
TableCell.displayName = "TableCell";

// Hook para detectar se o dispositivo é mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isMobile;
}

// Interface para o componente DataTable reutilizável
interface DataTableProps<TData, TValue> {
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Inicializar estados com valores das query params se syncWithQueryParams estiver ativado
  const getInitialStateFromQueryParams = () => {
    if (!syncWithQueryParams) return {};

    const params = new URLSearchParams(searchParams);
    const stateFromParams: any = {};

    // Recuperar ordenação
    if (params.has("sort")) {
      const sortParam = params.get("sort");
      const sortDir = params.get("dir") || "asc";
      if (sortParam) {
        stateFromParams.sorting = [
          {
            id: sortParam,
            desc: sortDir === "desc",
          },
        ];
      }
    }

    return stateFromParams;
  };

  const initialState = getInitialStateFromQueryParams();

  const [sorting, setSorting] = React.useState<SortingState>(initialState.sorting || initialSorting);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialRowSelection);

  // Estado local para o valor do input de pesquisa
  const [searchValue, setSearchValue] = React.useState<string>(
    syncWithQueryParams ? searchParams.get("search") || "" : ""
  );

  // Estado para a coluna de filtro selecionada
  const [selectedFilterColumn, setSelectedFilterColumn] = React.useState<string>(
    syncWithQueryParams
      ? searchParams.get("filterColumn") || filterableColumns[0]?.id || ""
      : filterableColumns[0]?.id || ""
  );

  // Função para atualizar a URL com o termo de pesquisa e a coluna de filtro
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (syncWithQueryParams) {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set("search", value);
        // Adicionar a coluna de filtro aos parâmetros
        if (enableColumnFilter && selectedFilterColumn) {
          params.set("filterColumn", selectedFilterColumn);
        }
      } else {
        params.delete("search");
        // Se não houver termo de pesquisa, remover também a coluna de filtro
        if (!enableColumnFilter) {
          params.delete("filterColumn");
        }
      }

      // Resetar para a primeira página ao pesquisar
      params.delete("page");

      // Atualizar a URL com os novos parâmetros
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    }
  };

  // Função para atualizar a coluna de filtro
  const handleFilterColumnChange = (columnId: string) => {
    setSelectedFilterColumn(columnId);

    if (syncWithQueryParams && searchValue) {
      const params = new URLSearchParams(searchParams);
      params.set("filterColumn", columnId);

      // Resetar para a primeira página ao mudar o filtro
      params.delete("page");

      // Atualizar a URL com os novos parâmetros
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    }
  };

  // Atualizar query params quando os estados mudarem
  React.useEffect(() => {
    if (!syncWithQueryParams) return;

    const params = new URLSearchParams(searchParams);

    // Atualizar ordenação nas query params
    if (sorting.length > 0) {
      params.set("sort", sorting[0].id);
      params.set("dir", sorting[0].desc ? "desc" : "asc");
    } else {
      params.delete("sort");
      params.delete("dir");
    }

    // Atualizar a URL com os novos parâmetros
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [sorting, searchParams, pathname, router, syncWithQueryParams]);

  // Atualizar o valor do input e a coluna de filtro quando as query params mudarem
  React.useEffect(() => {
    if (syncWithQueryParams) {
      const params = new URLSearchParams(searchParams);
      const searchValue = params.get("search") || "";
      setSearchValue(searchValue);

      if (enableColumnFilter) {
        const filterColumn = params.get("filterColumn") || filterableColumns[0]?.id || "";
        setSelectedFilterColumn(filterColumn);
      }
    }
  }, [searchParams, syncWithQueryParams, enableColumnFilter, filterableColumns]);

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
    } else if (syncWithQueryParams) {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Encontrar o título da coluna de filtro selecionada
  const selectedFilterColumnTitle =
    filterableColumns.find((col) => col.id === selectedFilterColumn)?.title || "Todos os campos";

  // Renderização de cards para mobile
  const renderMobileCards = () => {
    if (data.length === 0) {
      return <div className="text-center text-sm text-muted-foreground py-6">{emptyMessage}</div>;
    }

    return (
      <div className="grid gap-4 grid-cols-1">
        {table.getRowModel().rows.map((row) => {
          const isSelected = row.getIsSelected();
          return (
            <Card
              key={row.id}
              className={`flex flex-col ${isSelected ? "border-primary" : ""}`}
              data-state={isSelected && "selected"}
            >
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {/* Usar a primeira coluna como título do card */}
                  {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {row
                  .getVisibleCells()
                  .slice(1)
                  .map((cell, index) => {
                    // Pular a primeira coluna, pois já está no título
                    if (index === 0) return null;

                    const headerContent = flexRender(cell.column.columnDef.header, { ...cell.getContext(), table });

                    return (
                      <div key={cell.id} className="grid grid-cols-2 gap-1">
                        <div className="text-sm font-medium text-muted-foreground">
                          {typeof headerContent === "string" ? headerContent : cell.column.id}
                        </div>
                        <div className="text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                      </div>
                    );
                  })}
              </CardContent>
              {enableRowSelection && (
                <CardFooter className="pt-2 border-t">
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                      {isSelected ? "Selecionado" : "Toque para selecionar"}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => row.toggleSelected(!isSelected)}>
                      {isSelected ? "Desmarcar" : "Selecionar"}
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`w-full space-y-4 ${className || ""}`}>
      {/* Header com filtros e controles */}
      {(enableFiltering || enableColumnVisibility || createButton) && (
        <div className="flex flex-col lg:!flex-row gap-2 items-center">
          <div className="space-x-2 w-full">
            {enableFiltering && syncWithQueryParams && (
              <div className="flex w-full lg:max-w-lg">
                <Input
                  placeholder={filterPlaceholder}
                  value={searchValue}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className={`w-full px-3 py-2 border border-input text-sm ${
                    enableColumnFilter ? "rounded-l-none" : ""
                  }`}
                />

                {enableColumnFilter && filterableColumns.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-r-none border-r-0 px-3 focus-visible:ring-0 focus-visible:ring-offset-0 ml-2"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup value={selectedFilterColumn} onValueChange={handleFilterColumnChange}>
                        {filterableColumns.map((column) => (
                          <DropdownMenuRadioItem key={column.id} value={column.id}>
                            {column.title}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>

          {createButton && createButton}
        </div>
      )}

      {/* Tabela para desktop ou Cards para mobile */}
      {isMobile ? (
        renderMobileCards()
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
      <div className="flex items-center justify-between space-x-2">
        {enableRowSelection && (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} linha(s)
            selecionada(s).
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            className="px-3 py-2 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft />
          </Button>
          <div className="flex items-center space-x-1 text-sm">
            <span>Página</span>
            <strong>
              {currentPage} de {totalPages}
            </strong>
          </div>
          <Button
            className="px-3 py-2 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
