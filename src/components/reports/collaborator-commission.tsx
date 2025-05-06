"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectWithScroll } from "@/components/calendar/select-with-scroll";
import { DateRange } from "react-day-picker";
import { Collaborator } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "../ui/date-picker-range";
import { useRouter, useSearchParams } from "next/navigation";
import { getCollaboratorCommission } from "@/actions/reports/getCollaboratorCommission";
import { useEffect, useState } from "react";

interface CollaboratorCommissionProps {
  initialCollaborators: Collaborator[];
  initialCommissionData: {
    collaboratorId: string;
    name: string;
    totalServices: number;
    totalRevenue: number;
    commission: number;
  }[];
  initialSelectedCollaborator?: string;
  initialDateRange: DateRange;
}

export function CollaboratorCommission({
  initialCollaborators,
  initialCommissionData,
  initialSelectedCollaborator,
  initialDateRange,
}: CollaboratorCommissionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCollaborator, setSelectedCollaborator] = useState<
    string | undefined
  >(initialSelectedCollaborator);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange
  );
  const [commissionData, setCommissionData] = useState(initialCommissionData);
  const [loading, setLoading] = useState(false);

  // Atualiza a URL ao mudar colaborador ou datas
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCollaborator) {
      params.set("collaboratorId", selectedCollaborator);
    } else {
      params.delete("collaboratorId");
    }
    if (dateRange?.from) params.set("fromCollab", dateRange.from.toISOString());
    if (dateRange?.to) params.set("toCollab", dateRange.to.toISOString());
    router.replace(`?${params.toString()}`);
  }, [selectedCollaborator, dateRange, router]);

  // Busca dados ao mudar colaborador ou datas
  useEffect(() => {
    async function fetchCommission() {
      setLoading(true);
      const result = await getCollaboratorCommission(
        selectedCollaborator,
        dateRange?.from,
        dateRange?.to
      );
      if (result.success) {
        setCommissionData(result.data);
      } else {
        setCommissionData([]);
      }
      setLoading(false);
    }
    fetchCommission();
  }, [selectedCollaborator, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comissão de Colaboradores</CardTitle>
        <CardDescription>
          Visualize as comissões dos colaboradores por período
        </CardDescription>
        <div className="flex flex-col gap-4 mt-4">
          <div className="w-full">
            <SelectWithScroll
              label="Colaborador"
              placeholder="Todos os colaboradores"
              options={initialCollaborators}
              value={selectedCollaborator}
              onChange={setSelectedCollaborator}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </div>
          <div className="w-full">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              fromKey="fromCollab"
              toKey="toCollab"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : commissionData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado encontrado para o período selecionado
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead className="text-right">
                    Total de Serviços
                  </TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.map((item) => (
                  <TableRow key={item.collaboratorId}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {item.totalServices}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.commission)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
