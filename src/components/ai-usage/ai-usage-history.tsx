"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AIUsage } from "@prisma/client";

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
  const [search, setSearch] = useState(currentSearch);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const newDirection =
      currentSortField === field && currentSortDirection === "asc" ? "desc" : "asc";
    
    params.set("sortField", field);
    params.set("sortDirection", newDirection);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Concluído", variant: "default" },
      abandoned: { label: "Abandonado", variant: "destructive" },
      in_progress: { label: "Em Andamento", variant: "secondary" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atendimentos</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("client.fullName")}
                    className="h-auto p-0 font-semibold"
                  >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("date")}
                    className="h-auto p-0 font-semibold"
                  >
                    Data e Hora
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Tipo de Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum atendimento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell className="font-medium">
                      {usage.client?.fullName || "Não cadastrado"}
                    </TableCell>
                    <TableCell>{usage.clientPhone}</TableCell>
                    <TableCell>
                      {format(new Date(usage.date), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="capitalize">{usage.serviceType}</TableCell>
                    <TableCell>{getStatusBadge(usage.status)}</TableCell>
                    <TableCell className="capitalize">{usage.source}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}