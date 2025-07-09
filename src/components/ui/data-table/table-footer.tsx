import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../button";

interface TableFooterProps {
  enableRowSelection: boolean;
  selectedRowsCount: number;
  totalRowsCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TableFooter({
  enableRowSelection,
  selectedRowsCount,
  totalRowsCount,
  currentPage,
  totalPages,
  onPageChange,
}: TableFooterProps) {
  return (
    <div className="flex flex-col lg:!flex-row items-center justify-between gap-2">
      {enableRowSelection && (
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedRowsCount} of {totalRowsCount} linha(s) selecionada(s).
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button
          className="px-3 py-2 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
