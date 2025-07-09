import * as React from "react";
import { TableFilters } from "./table-filters";

interface TableHeaderProps {
  enableFiltering: boolean;
  enableColumnVisibility: boolean;
  enableColumnFilter: boolean;
  filterPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterableColumns: Array<{ id: string; title: string; prismaField?: string }>;
  selectedFilterColumn: string;
  onFilterColumnChange: (columnId: string) => void;
  createButton?: React.ReactNode;
  syncWithQueryParams: boolean;
}

export function TableHeader({
  enableFiltering,
  enableColumnVisibility,
  enableColumnFilter,
  filterPlaceholder,
  searchValue,
  onSearchChange,
  filterableColumns,
  selectedFilterColumn,
  onFilterColumnChange,
  createButton,
  syncWithQueryParams,
}: TableHeaderProps) {
  if (!enableFiltering && !enableColumnVisibility && !createButton) return null;

  return (
    <div className="flex flex-col lg:!flex-row gap-2 items-center">
      <div className="space-x-2 w-full">
        {enableFiltering && syncWithQueryParams && (
          <TableFilters
            enableFiltering={enableFiltering}
            enableColumnFilter={enableColumnFilter}
            filterPlaceholder={filterPlaceholder}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            filterableColumns={filterableColumns}
            selectedFilterColumn={selectedFilterColumn}
            onFilterColumnChange={onFilterColumnChange}
          />
        )}
      </div>

      {createButton && createButton}
    </div>
  );
}