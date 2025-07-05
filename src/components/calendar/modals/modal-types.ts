import { Calendar } from "@prisma/client";

// Interface base para todos os tipos de modal
export interface BaseCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Props para modal de ações do calendário
export interface CalendarActionsModalProps extends BaseCalendarModalProps {
  type: "actions";
  calendar: Calendar;
  onEdit: () => void;
  onDelete: () => void;
}

// Props para modal de limite de calendários
export interface CalendarLimitModalProps extends BaseCalendarModalProps {
  type: "limit";
  currentCount: number;
  limit: number;
  onUpgrade?: () => void;
}

// Props para modal de confirmação genérico
export interface CalendarConfirmationModalProps extends BaseCalendarModalProps {
  type: "confirmation";
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

// Union type para todas as props possíveis
export type CalendarUnifiedModalProps = 
  | CalendarActionsModalProps 
  | CalendarLimitModalProps 
  | CalendarConfirmationModalProps;