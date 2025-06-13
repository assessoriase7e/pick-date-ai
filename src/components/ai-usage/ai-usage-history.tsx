"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AIUsage } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

type AIUsageWithClient = AIUsage & {
  client?: {
    fullName: string;
  } | null;
};

type AIUsageHistoryProps = {
  history: AIUsageWithClient[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  currentSearch?: string;
  currentSortField?: string;
  currentSortDirection?: "asc" | "desc";
};

export function AIUsageHistory({
  history,
  pagination,
  currentSearch = "",
  currentSortField,
  currentSortDirection,
}: AIUsageHistoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const newDirection =
      currentSortField === field && currentSortDirection === "asc" ? "desc" : "asc";
    
    params.set("sortField", field);
    params.set("sortDirection", newDirection);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Concluído", variant: "default" },
      abandoned: { label: "Abandonado", variant: "destructive" },
      in_progress: { label: "Em Andamento", variant: "secondary" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>;
  };

  const columns: ColumnDef<AIUsageWithClient>[] = [
    {
      id: "client.fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort("client.fullName")}
          className="h-auto p-0 font-semibold text-xs sm:text-sm"
        >
          Nome
          <ArrowUpDown className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
        </Button>
      ),
      accessorFn: (row) => row.client?.fullName || "Não cadastrado",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="font-medium text-xs sm:text-sm">
            <div className="truncate max-w-[120px] sm:max-w-none" title={value}>
              {value}
            </div>
          </div>
        );
      },
    },
    {
      id: "clientPhone",
      header: "Telefone",
      accessorKey: "clientPhone",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="text-xs sm:text-sm">
            <div className="truncate max-w-[100px] sm:max-w-none" title={value}>
              {value}
            </div>
          </div>
        );
      },
    },
    {
      id: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort("date")}
          className="h-auto p-0 font-semibold text-xs sm:text-sm"
        >
          Data e Hora
          <ArrowUpDown className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
        </Button>
      ),
      accessorKey: "date",
      cell: ({ getValue }) => {
        const value = getValue() as Date;
        return (
          <div className="text-xs sm:text-sm">
            <div className="whitespace-nowrap">
              {format(new Date(value), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>
        );
      },
    },
    {
      id: "serviceType",
      header: "Tipo de Serviço",
      accessorKey: "serviceType",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="capitalize text-xs sm:text-sm">
            <div className="truncate max-w-[100px] sm:max-w-none" title={value}>
              {value}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return getStatusBadge(value);
      },
    },
    {
      id: "source",
      header: "Origem",
      accessorKey: "source",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="capitalize text-xs sm:text-sm">
            <div className="truncate max-w-[80px] sm:max-w-none" title={value}>
              {value}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg sm:text-xl">Histórico de Atendimentos</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <DataTable
          columns={columns}
          data={history}
          enableSearch={true}
          searchPlaceholder="Buscar por telefone..."
          pagination={pagination}
          onSearch={handleSearch}
          sortableColumns={["client.fullName", "date"]}
        />
      </CardContent>
    </Card>
  );
}