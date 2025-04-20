"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Components reutilizáveis

const PaginationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background px-2 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
      className
    )}
    {...props}
  />
));
PaginationItem.displayName = "PaginationItem";

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "h-9 w-9 flex items-center justify-center text-sm",
      className
    )}
    {...props}
  >
    &hellip;
  </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";

const PaginationButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-9 px-3 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
PaginationButton.displayName = "PaginationButton";

export {
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
  PaginationButton as PaginationPrevious,
  PaginationButton as PaginationNext,
};

// Componente principal

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  siblingsCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  siblingsCount = 1,
}: PaginationProps) {
  const generatePages = () => {
    const totalShown = siblingsCount * 2 + 5;
    if (totalPages <= totalShown) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const leftSibling = Math.max(currentPage - siblingsCount, 1);
    const rightSibling = Math.min(currentPage + siblingsCount, totalPages);

    if (leftSibling > 2) {
      pages.push(1, "...");
    } else {
      for (let i = 1; i < leftSibling; i++) pages.push(i);
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    if (rightSibling < totalPages - 1) {
      pages.push("...", totalPages);
    } else {
      for (let i = rightSibling + 1; i <= totalPages; i++) pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePages();

  return (
    <div className="flex w-full items-center justify-end py-4">
      <PaginationContent>
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Anterior
        </PaginationButton>

        {pageNumbers.map((page, idx) =>
          typeof page === "string" ? (
            <PaginationEllipsis key={`ellipsis-${idx}`} />
          ) : (
            <PaginationItem
              key={page}
              onClick={() => onPageChange(page)}
              data-active={currentPage === page}
              aria-current={currentPage === page ? "page" : undefined}
              disabled={isLoading}
            >
              {page}
            </PaginationItem>
          )
        )}

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Próximo
        </PaginationButton>
      </PaginationContent>
    </div>
  );
}
