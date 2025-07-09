import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SortingState, VisibilityState, RowSelectionState } from "@tanstack/react-table";

// Hook para detectar se o dispositivo é mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isMobile;
}

// Hook para gerenciar a sincronização com parâmetros de URL
export function useTableQueryParams({
  syncWithQueryParams,
  initialSorting,
  initialColumnVisibility,
  initialRowSelection,
  filterableColumns,
  enableColumnFilter,
}: {
  syncWithQueryParams: boolean;
  initialSorting: SortingState;
  initialColumnVisibility: VisibilityState;
  initialRowSelection: RowSelectionState;
  filterableColumns: Array<{ id: string; title: string; prismaField?: string }>;
  enableColumnFilter: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    if (syncWithQueryParams) {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return {
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    searchValue,
    setSearchValue,
    selectedFilterColumn,
    setSelectedFilterColumn,
    handleSearchChange,
    handleFilterColumnChange,
    handlePageChange,
    router,
    pathname,
    searchParams,
  };
}