"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentFullData } from "@/types/calendar";
import { Service } from "@prisma/client";

interface AppointmentFilterProps {
  appointments: AppointmentFullData[];
  services: Service[];
  onFilterChange: (filtered: AppointmentFullData[]) => void;
}

export function AppointmentFilter({ appointments, services, onFilterChange }: AppointmentFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, serviceFilter);
  };

  const handleServiceChange = (value: string) => {
    setServiceFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (term: string, service: string) => {
    let filtered = [...appointments];

    if (term) {
      filtered = filtered.filter(
        (apt) =>
          apt.client?.fullName.toLowerCase().includes(term) ||
          apt.service?.name.toLowerCase().includes(term)
      );
    }

    if (service !== "all") {
      filtered = filtered.filter((apt) => apt.serviceId === parseInt(service));
    }

    onFilterChange(filtered);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Nome do cliente ou serviço"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Serviço</Label>
          <Select value={serviceFilter} onValueChange={handleServiceChange}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Todos os serviços" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os serviços</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}