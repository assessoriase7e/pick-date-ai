import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export const collabColumns: ColumnDef<any>[] = useMemo(
  () => [
    {
      accessorKey: "clientName",
      header: "Cliente",
    },
    {
      accessorKey: "serviceName",
      header: "Serviço",
    },
    {
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price") || "0");
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price);
        return formatted;
      },
    },
    {
      accessorKey: "formattedDate",
      header: "Data",
    },
  ],
  []
);
