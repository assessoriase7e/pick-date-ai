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
import { CommissionMobileCard } from "./commission-mobile-card";

type CommissionData = {
  collaboratorId: number;
  name: string;
  totalServices: number;
  totalRevenue: number;
  commission: number;
};

interface CollaboratorCommissionProps {
  collaborators: Collaborator[];
  commissionData: CommissionData[];
  selectedCollaborator?: number;
  dateRange: DateRange;
}

export function CollaboratorCommission({
  collaborators,
  commissionData,
  selectedCollaborator,
  dateRange,
}: CollaboratorCommissionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCollaboratorChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== null) {
      params.set("collaboratorId", value);
    } else {
      params.delete("collaboratorId");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDateChange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) params.set("fromCollab", range.from.toISOString());
    if (range?.to) params.set("toCollab", range.to.toISOString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filtrar os dados de comissão com base no colaborador selecionado
  const filteredCommissionData = selectedCollaborator
    ? commissionData.filter(
        (item) => item.collaboratorId === selectedCollaborator
      )
    : commissionData;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comissão de Profissionais</CardTitle>
        <CardDescription>
          Visualize as comissões dos profissionais por período
        </CardDescription>
        <div className="flex flex-col gap-4 mt-4">
          <div className="w-full">
            <SelectWithScroll
              label="Profissional"
              placeholder="Todos os profissionais"
              options={[
                { id: null, name: "Todos os profissionais" }, // Opção para limpar o filtro
                ...collaborators,
              ]}
              value={selectedCollaborator ?? ""}
              onChange={(value) =>
                handleCollaboratorChange(
                  String(value) ? String(value) : undefined
                )
              }
              getOptionLabel={(option) => option?.name ?? "Sem nome"}
              getOptionValue={(option) => String(option.id)}
            />
          </div>
          <div className="w-full">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={handleDateChange}
              fromKey="fromCollab"
              toKey="toCollab"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCommissionData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado encontrado para o período selecionado
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visualização Desktop */}
            <div className="rounded-md border hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-right">
                      Total de Serviços
                    </TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissionData.map((item) => (
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

            {/* Visualização Mobile */}
            <div className="md:hidden space-y-4">
              {filteredCommissionData.map((item) => (
                <CommissionMobileCard
                  key={item.collaboratorId}
                  name={item.name}
                  totalServices={item.totalServices}
                  totalRevenue={item.totalRevenue}
                  commission={item.commission}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
