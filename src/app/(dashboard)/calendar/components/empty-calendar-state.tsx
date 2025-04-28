import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface EmptyCalendarStateProps {
  setOpen: (open: boolean) => void;
}

export function EmptyCalendarState({ setOpen }: EmptyCalendarStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        Nenhum calendário encontrado
      </h3>
      <p className="text-muted-foreground mb-4 text-center">
        Você ainda não criou nenhum calendário. Clique no botão acima para
        criar um novo.
      </p>
      <Button onClick={() => setOpen(true)}>
        <Calendar className="mr-2 h-4 w-4" />
        Criar Calendário
      </Button>
    </div>
  );
}