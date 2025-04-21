"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { listProfessionals } from "@/actions/professionals/getMany";

interface ProfessionalComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProfessionalCombobox({
  value,
  onChange,
}: ProfessionalComboboxProps) {
  const [open, setOpen] = useState(false);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");

  useEffect(() => {
    async function fetchProfessionals() {
      setLoading(true);
      try {
        const result = await listProfessionals(1, 1000);
        if (result.success) {
          setProfessionals(result.data.professionals);

          if (value) {
            const selected = result.data.professionals.find(
              (p: any) => p.id === value
            );
            if (selected) {
              setSelectedProfessional(selected.name);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessionals();
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading
            ? "Carregando..."
            : value && selectedProfessional
            ? selectedProfessional
            : "Selecione um profissional"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar profissional..." />
          <CommandList>
            <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {professionals.map((professional) => (
                <CommandItem
                  key={professional.id}
                  value={professional.name}
                  onSelect={() => {
                    onChange(professional.id);
                    setSelectedProfessional(professional.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === professional.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {professional.name} - {professional.company}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
