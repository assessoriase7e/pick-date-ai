import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SelectFieldProps<T> {
  label: string;
  placeholder: string;
  options: T[];
  value: string | undefined;
  onChange: (value: string) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  error?: string;
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
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add a null check when filtering options
  // In the useMemo for filteredOptions, ensure options is an array before filtering
  
  const filteredOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    
    return options.filter((option) => {
      if (!searchTerm) return true;
      const label = getOptionLabel(option).toLowerCase();
      return label.includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm, getOptionLabel]);

  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">{label}</label>

      {/* Desktop Select */}
      <div className="hidden md:block">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
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
              filteredOptions.map((option) => (
                <SelectItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                >
                  {getOptionLabel(option)}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Drawer Select */}
      <div className="block md:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {value
                ? getOptionLabel(
                    options.find((opt) => getOptionValue(opt) === value)!
                  )
                : placeholder}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-4">
              <DrawerTitle className="mb-4 text-lg font-medium">
                {label}
              </DrawerTitle>
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="mb-2"
              />

              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <Button
                      key={getOptionValue(option)}
                      variant={
                        getOptionValue(option) === value ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => {
                        onChange(getOptionValue(option));
                        setOpen(false);
                      }}
                    >
                      {getOptionLabel(option)}
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    Nenhum resultado encontrado.
                  </div>
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
