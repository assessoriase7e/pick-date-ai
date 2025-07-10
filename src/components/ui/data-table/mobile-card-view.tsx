import { Row, flexRender, Table } from "@tanstack/react-table";
import { Card, CardContent, CardFooter } from "../card";
import { cn } from "@/lib/utils";

interface MobileCardViewProps<TData> {
  rows: Row<TData>[];
  enableRowSelection: boolean;
  emptyMessage: string;
  table: Table<TData>; // Propriedade table
  fileName?: string; // Nova propriedade para o nome do arquivo
}

export function MobileCardView<TData>({
  rows,
  enableRowSelection,
  emptyMessage,
  table,
  fileName,
}: MobileCardViewProps<TData>) {
  if (rows.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-6">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {rows.map((row) => {
        const isSelected = row.getIsSelected();
        return (
          <Card
            key={row.id}
            className={cn(
              `flex flex-col ${isSelected ? "border-primary" : ""} ${enableRowSelection ? "cursor-pointer" : ""}`,
              "pb-0"
            )}
            data-state={isSelected && "selected"}
            onClick={enableRowSelection ? () => row.toggleSelected(!isSelected) : undefined}
          >
            <CardContent className="py-5 mt-0 space-y-5">
              {row
                .getVisibleCells()
                // Aplicar slice(1) apenas quando enableRowSelection for true
                .filter((_, index) => !enableRowSelection || index > 0)
                .map((cell) => {
                  const column = cell.column;
                  const header = table
                    .getHeaderGroups()
                    .flatMap((headerGroup) => headerGroup.headers.filter((h) => h.id === column.id))[0];

                  // Usar o header correto para renderizar o cabeçalho
                  const headerContent = header ? flexRender(column.columnDef.header, header.getContext()) : column.id;

                  return (
                    <div key={cell.id} className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        {typeof headerContent === "string" ? headerContent : column.id}
                      </div>
                      <div className="text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                    </div>
                  );
                })}
            </CardContent>
            {enableRowSelection && (
              <CardFooter className="border-t flex justify-between items-center h-16">
                <div className="text-xs text-muted-foreground">
                  {isSelected ? "Selecionado" : "Toque para selecionar"}
                </div>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
