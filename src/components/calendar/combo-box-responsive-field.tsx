import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FormControl, FormLabel, FormMessage, FormItem } from "@/components/ui/form";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboBoxResponsiveFieldProps<T> {
  label: string;
  placeholder: string;
  options: T[];
  value: string | undefined;
  onChange: (value: string) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  getOptionExtra?: (option: T) => React.ReactNode;
  error?: string;
}

export function ComboBoxResponsiveField<T>({
  label,
  placeholder,
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  getOptionExtra,
  error,
}: ComboBoxResponsiveFieldProps<T>) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  const content = (
    <Command>
      <CommandInput placeholder={placeholder} />
      <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
      <CommandGroup className="max-h-60 overflow-y-auto">
        {options.map((option) => (
          <CommandItem
            key={getOptionValue(option)}
            value={getOptionValue(option)}
            onSelect={() => {
              onChange(getOptionValue(option));
              setOpen(false);
            }}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                getOptionValue(option) === value ? "opacity-100" : "opacity-0"
              )}
            />
            {getOptionLabel(option)}
            {getOptionExtra && getOptionExtra(option)}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      {/* Popover para desktop */}
      <div className="hidden md:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between",
                  !value && "text-muted-foreground"
                )}
              >
                {selectedOption ? getOptionLabel(selectedOption) : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">{content}</PopoverContent>
        </Popover>
      </div>
      {/* Drawer para mobile */}
      <div className="block md:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between",
                  !value && "text-muted-foreground"
                )}
              >
                {selectedOption ? getOptionLabel(selectedOption) : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mt-4 border-t">{content}</div>
          </DrawerContent>
        </Drawer>
      </div>
      <FormMessage>{error}</FormMessage>
    </FormItem>
  );
}