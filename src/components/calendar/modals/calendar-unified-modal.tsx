"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Edit, Trash2, Info } from "lucide-react";
import { useState } from "react";
import { CalendarUnifiedModalProps } from "./modal-types";

export function CalendarUnifiedModal(props: CalendarUnifiedModalProps) {
  const { open, onOpenChange, type } = props;

  const renderContent = () => {
    switch (type) {
      case "actions":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Ações do Calendário
              </DialogTitle>
              <DialogDescription>Escolha uma ação para o calendário "{props.calendar?.name}"</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-4">
              <Button
                onClick={() => {
                  props.onEdit();
                  onOpenChange(false);
                }}
                variant="outline"
                className="justify-start"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Calendário
              </Button>

              <Button
                onClick={() => {
                  props.onDelete();
                  onOpenChange(false);
                }}
                variant="destructive"
                className="justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Calendário
              </Button>
            </div>
          </>
        );

      case "limit":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Limite de Calendários Atingido
              </DialogTitle>
              <DialogDescription>
                Você atingiu o limite de {props.limit} calendários em seu plano atual. Atualmente você tem{" "}
                {props.currentCount} calendários.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">
                    Limite atual: {props.currentCount}/{props.limit}
                  </span>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  Para criar mais calendários, considere fazer upgrade do seu plano.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {props.onUpgrade && <Button onClick={props.onUpgrade}>Fazer Upgrade</Button>}
            </DialogFooter>
          </>
        );

      case "confirmation":
        return (
          <>
            <DialogHeader>
              <DialogTitle>{props.title}</DialogTitle>
              <DialogDescription>{props.description}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {props.cancelText || "Cancelar"}
              </Button>
              <Button
                variant={props.variant || "default"}
                onClick={() => {
                  props.onConfirm();
                  onOpenChange(false);
                }}
              >
                {props.confirmText || "Confirmar"}
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{renderContent()}</DialogContent>
    </Dialog>
  );
}

// Hooks de conveniência para facilitar o uso
export function useCalendarActionsModal() {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return { open, openModal, closeModal, setOpen };
}

export function useCalendarLimitModal() {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return { open, openModal, closeModal, setOpen };
}
