import { Calendar } from "@prisma/client";

export interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export interface ConfirmationModalProps extends BaseModalProps {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export interface CalendarActionModalProps extends BaseModalProps {
  calendar: Calendar;
  onEdit: () => void;
  onDelete: () => void;
}

export interface CalendarLimitModalProps extends BaseModalProps {
  currentCount: number;
  limit: number;
  onUpgrade?: () => void;
}