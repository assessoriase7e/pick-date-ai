import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SelectFieldProps<T> {
  label?: string;
  placeholder: string;
  options: T[];
  value: string | number | undefined;
  onChange: (value: number | string) => void;
  getOptionLabel: (option: T) => number | string;
  getOptionValue: (option: T) => number | string;
  error?: string;
  disabled?: boolean; // Adicionando a propriedade disabled
}

export function SelectWithScroll<T>({
  label,
  placeholder,
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  error,
  disabled = false, // Valor padrão para disabled
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];

    return options.filter((option) => {
      if (!searchTerm) return true;
      const label = getOptionLabel(option);
      return String(label).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm, getOptionLabel]);

  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 font-medium text-sm">{label}</label>}

      {/* Desktop Select */}
      <div className="hidden md:block">
        <Select
          value={value !== undefined ? String(value) : ""}
          onValueChange={(val) => onChange(isNaN(Number(val)) ? val : Number(val))}
          disabled={disabled} // Adicionando disabled aqui
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto z-[9999]">
            <div className="p-2">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="mb-2"
              />
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const optionValue = getOptionValue(option);
                return (
                  <SelectItem key={String(optionValue)} value={String(optionValue)}>
                    {getOptionLabel(option)}
                  </SelectItem>
                );
              })
            ) : (
              <div className="p-2 text-sm text-muted-foreground">Nenhum resultado encontrado.</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Drawer Select */}
      <div className="block md:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={disabled} // Adicionando disabled aqui
            >
              {value !== undefined
                ? getOptionLabel(options.find((opt) => String(getOptionValue(opt)) === String(value))!)
                : placeholder}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-4">
              <DrawerTitle className="mb-4 text-lg font-medium">{label}</DrawerTitle>
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="mb-2"
              />

              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const optionValue = getOptionValue(option);
                    return (
                      <Button
                        key={String(optionValue)}
                        variant={String(optionValue) === String(value) ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          onChange(isNaN(Number(optionValue)) ? optionValue : Number(optionValue));
                          setOpen(false);
                        }}
                      >
                        {getOptionLabel(option)}
                      </Button>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground text-center">Nenhum resultado encontrado.</div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
}
