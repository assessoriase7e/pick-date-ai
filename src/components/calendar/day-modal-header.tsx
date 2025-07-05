"use client";
import moment from "moment";
import { Collaborator } from "@prisma/client";

interface DayModalHeaderProps {
  date: Date | null;
  collaborator: Collaborator | null;
  className?: string;
}

export function DayModalHeader({ date, collaborator, className }: DayModalHeaderProps) {
  const formattedDate = date ? moment(date).locale("pt-br").format("DD/MM/YYYY") : "";

  return (
    <div className={`p-3 px-4 bg-primary rounded-lg text-foreground ${className}`}>
      <h2 className="text-sm font-medium text-center">
        {collaborator?.name} | {collaborator?.profession} | {formattedDate}
      </h2>
    </div>
  );
}