import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../dropdown-menu";

interface TableFiltersProps {
  enableFiltering: boolean;
  enableColumnFilter: boolean;
  filterPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterableColumns: Array<{ id: string; title: string; prismaField?: string }>;
  selectedFilterColumn: string;
  onFilterColumnChange: (columnId: string) => void;
}

export function TableFilters({
  enableFiltering,
  enableColumnFilter,
  filterPlaceholder,
  searchValue,
  onSearchChange,
  filterableColumns,
  selectedFilterColumn,
  onFilterColumnChange,
}: TableFiltersProps) {
  if (!enableFiltering) return null;

  return (
    <div className="flex w-full lg:max-w-lg">
      <Input
        placeholder={filterPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
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
            <DropdownMenuRadioGroup value={selectedFilterColumn} onValueChange={onFilterColumnChange}>
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
  );
}