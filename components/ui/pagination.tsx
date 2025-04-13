"use client"

import { cn } from "@/lib/utils"

const PaginationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center", className)} {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-secondary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-secondary data-[active]:text-secondary-foreground",
        className,
      )}
      {...props}
    />
  ),
)
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-secondary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-secondary data-[active]:text-secondary-foreground",
        className,
      )}
      {...props}
    />
  ),
)
PaginationLink.displayName = "PaginationLink"

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("h-8 w-8 items-center justify-center text-sm font-medium", className)} {...props}>
      &hellip;
    </span>
  ),
)
PaginationEllipsis.displayName = "PaginationEllipsis"

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-secondary focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-secondary focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
)
PaginationNext.displayName = "PaginationNext"

export { PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis, PaginationPrevious, PaginationNext }

import * as React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  const getPageNumbers = () => {
    const pageNumbers = []
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex w-full items-center justify-center">
      <PaginationContent>
        {hasPreviousPage ? (
          <PaginationPrevious href="#" onClick={() => onPageChange(currentPage - 1)}>
            Anterior
          </PaginationPrevious>
        ) : (
          <PaginationPrevious href="#" disabled>
            Anterior
          </PaginationPrevious>
        )}
        {pageNumbers.map((page) => (
          <PaginationItem key={page} onClick={() => onPageChange(page)} data-active={currentPage === page}>
            {page}
          </PaginationItem>
        ))}
        {hasNextPage ? (
          <PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)}>
            Próximo
          </PaginationNext>
        ) : (
          <PaginationNext href="#" disabled>
            Próximo
          </PaginationNext>
        )}
      </PaginationContent>
    </div>
  )
}
