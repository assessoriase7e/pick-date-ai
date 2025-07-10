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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../drawer";
import { useState } from "react";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!enableFiltering) return null;

  const handleFilterColumnChange = (columnId: string) => {
    onFilterColumnChange(columnId);
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex w-full lg:max-w-lg">
      <Input
        placeholder={filterPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        className={`w-full py-2 border border-input text-sm ${enableColumnFilter ? "rounded-r-none" : ""}`}
      />

      {enableColumnFilter && filterableColumns.length > 0 && (
        <>
          {/* Desktop - Dropdown Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-l-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
          </div>

          {/* Mobile - Drawer */}
          <div className="md:hidden">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-l-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filtrar por coluna</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-2">
                  {filterableColumns.map((column) => (
                    <Button
                      key={column.id}
                      variant={selectedFilterColumn === column.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleFilterColumnChange(column.id)}
                    >
                      {column.title}
                    </Button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </>
      )}
    </div>
  );
}
