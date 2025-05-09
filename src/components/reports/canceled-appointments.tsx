"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCanceledAppointments } from "@/actions/reports/getCanceledAppointments";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Input } from "../ui/input";
import { AppointmentMobileCard } from "./appointment-mobile-card";

interface CanceledAppointmentsProps {
  initialAppointments: {
    id: string;
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
    collaboratorName: string;
  }[];
  initialFromDate?: Date;
  initialToDate?: Date;
}

const columns: ColumnDef<{
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  collaboratorName: string;
}>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "serviceName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Serviço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Horário
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "collaboratorName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Profissional
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];

export function CanceledAppointments({
  initialAppointments,
  initialFromDate,
  initialToDate,
}: CanceledAppointmentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialFromDate || moment().subtract(1, "M").startOf("day").toDate(),
    to: initialToDate || moment().endOf("day").toDate(),
  });

  const fetchData = async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const result = await getCanceledAppointments(from, to);
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos cancelados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange?.from || !newDateRange?.to) return;

    setDateRange(newDateRange);

    const params = new URLSearchParams(searchParams.toString());
    params.set("fromCanceled", newDateRange.from.toISOString());
    params.set("toCanceled", newDateRange.to.toISOString());
    router.push(`?${params.toString()}`, { scroll: false });

    fetchData(newDateRange.from, newDateRange.to);
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && initialAppointments.length === 0) {
      fetchData(dateRange.from, dateRange.to);
    }
  }, []);

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <Card className="w-full">
      <CardHeader className="lg:flex-row justify-between gap-5">
        <div>
          <CardTitle>Agendamentos Cancelados</CardTitle>
          <CardDescription>
            Visualize os agendamentos cancelados por período
          </CardDescription>
        </div>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateChange}
          fromKey="fromCanceled"
          toKey="toCanceled"
        />
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <Input
            placeholder="Filtrar por cliente..."
            value={
              (table.getColumn("clientName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("clientName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum agendamento cancelado encontrado no período selecionado
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visualização Desktop */}
            <div className="rounded-md border hidden md:block">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Nenhum resultado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Visualização Mobile */}
            <div className="md:hidden space-y-4">
              {table.getRowModel().rows.map((row) => (
                <AppointmentMobileCard key={row.id} row={row} />
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
