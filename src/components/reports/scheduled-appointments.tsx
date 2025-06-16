"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getScheduledAppointments } from "@/actions/reports/getScheduledAppointments";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { AppointmentMobileCard } from "./appointment-mobile-card";
import { Appointment } from "@prisma/client";
import { AppointmentFullData } from "@/types/calendar";

interface ScheduledAppointmentsProps {
  initialAppointments: AppointmentFullData[];
  initialFromDate?: Date;
  initialToDate?: Date;
}

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "clientName",
    header: "Cliente",
  },
  {
    accessorKey: "serviceName",
    header: "Serviço",
  },
  {
    accessorKey: "date",
    header: "Data",
  },
  {
    accessorKey: "time",
    header: "Horário",
  },
  {
    accessorKey: "collaboratorName",
    header: "Profissional",
  },
];

export function ScheduledAppointments({
  initialAppointments,
  initialFromDate,
  initialToDate,
}: ScheduledAppointmentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialFromDate || moment().startOf("day").toDate(),
    to: initialToDate || moment().add(1, "M").endOf("day").toDate(),
  });

  const fetchData = async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const result = await getScheduledAppointments(from, to);
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos agendados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange?.from || !newDateRange?.to) return;

    setDateRange(newDateRange);

    const params = new URLSearchParams(searchParams.toString());
    params.set("fromScheduled", newDateRange.from.toISOString());
    params.set("toScheduled", newDateRange.to.toISOString());
    router.push(`?${params.toString()}`, { scroll: false });

    fetchData(newDateRange.from, newDateRange.to);
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && initialAppointments.length === 0) {
      fetchData(dateRange.from, dateRange.to);
    }
  }, []);

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <Card className="w-full">
      <CardHeader className="lg:flex-row justify-between gap-5">
        <div>
          <CardTitle>Agendamentos Confirmados</CardTitle>
          <CardDescription>Visualize os agendamentos confirmados por período</CardDescription>
        </div>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateChange}
          fromKey="fromScheduled"
          toKey="toScheduled"
        />
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <Input
            placeholder="Filtrar por cliente..."
            value={(table.getColumn("clientName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("clientName")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum agendamento confirmado encontrado no período selecionado
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
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
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

            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
