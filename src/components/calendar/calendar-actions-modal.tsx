import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";
import { CalendarFullData } from "@/types/calendar";

interface CalendarActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendar: CalendarFullData | null;
  onEdit: (calendar: CalendarFullData) => void;
  onDelete: (calendar: CalendarFullData) => void;
}

export function CalendarActionsModal({
  open,
  onOpenChange,
  calendar,
  onEdit,
  onDelete,
}: CalendarActionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Opções do Calendário</DialogTitle>
        <div className="grid grid-cols-2 gap-4 py-4">
          <button
            className="flex flex-col items-center justify-center p-4 border rounded-lg"
            onClick={() => {
              if (calendar) {
                onEdit(calendar);
                onOpenChange(false);
              }
            }}
          >
            <Edit className="h-6 w-6 mb-2" />
            <span>Editar</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-4 border rounded-lg"
            onClick={() => {
              if (calendar) {
                onDelete(calendar);
                onOpenChange(false);
              }
            }}
          >
            <Trash2 className="h-6 w-6 mb-2" />
            <span>Excluir</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}