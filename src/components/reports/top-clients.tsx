"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { TopClientProps } from "@/actions/reports/getTopClientsBySpending";

interface TopClientsProps {
  topClientsByServices: {
    id: number;
    name: string;
    serviceCount: number;
    totalSpent: number;
  }[];
  topClientsBySpending: TopClientProps[];
}

export function TopClients({
  topClientsByServices,
  topClientsBySpending,
}: TopClientsProps) {
  const [activeTab, setActiveTab] = useState("services");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Clientes</CardTitle>
        <CardDescription>
          Visualize os clientes mais frequentes e os que mais gastam
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="hidden md:block">
            <TabsList className="mb-4">
              <TabsTrigger value="services">
                Por Quantidade de Serviços
              </TabsTrigger>
              <TabsTrigger value="spending">Por Valor Gasto</TabsTrigger>
            </TabsList>
          </div>

          <div className="block md:hidden mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="services">
                  Por Quantidade de Serviços
                </SelectItem>
                <SelectItem value="spending">Por Valor Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="services">
            {topClientsByServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado encontrado
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">
                        Total de Serviços
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClientsByServices.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {client.serviceCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="spending">
            {topClientsBySpending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado encontrado
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">
                        Valor Total Gasto
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClientsBySpending.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(client.totalSpent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
