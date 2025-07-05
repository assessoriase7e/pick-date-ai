"use client";
import { Calendar } from "lucide-react";
import { CreateCalendarModal } from "../modals/calendar-modals";
import { CollaboratorFullData } from "@/types/collaborator";

type EmptyCalendarStateProps = {
  collaborators: CollaboratorFullData[];
};

export function EmptyCalendarState({ collaborators }: EmptyCalendarStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">Nenhum calendário encontrado</h3>
      <p className="text-muted-foreground mb-4 text-center">
        Você ainda não criou nenhum calendário. Clique no botão abaixo para criar um novo.
      </p>
      <CreateCalendarModal collaborators={collaborators} />
    </div>
  );
}
