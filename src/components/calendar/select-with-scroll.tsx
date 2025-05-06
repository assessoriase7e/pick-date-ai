import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">{label}</label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[25svh] overflow-y-auto">
          {options.map((option) => (
            <SelectItem
              key={getOptionValue(option)}
              value={getOptionValue(option)}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
}
