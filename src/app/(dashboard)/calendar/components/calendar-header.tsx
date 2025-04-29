import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CalendarHeaderProps {
  setOpen: (open: boolean) => void;
}

export function CalendarHeader({ setOpen }: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-2 lg:mb-8">
      <h1 className="lg:text-3xl font-bold">Agendamento</h1>

      <Button onClick={() => setOpen(true)}>
        <Calendar className="mr-2 h-4 w-4" />
        Novo Calendário
      </Button>
    </div>
  );
}
