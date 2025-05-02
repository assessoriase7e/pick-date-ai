import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentFullData } from "@/types/calendar";
import React from "react"; // Import React
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AppointmentCardProps {
  appointment: AppointmentFullData;
  onEdit: () => void;
  style?: React.CSSProperties;
  duration: number;
}

export function AppointmentCard({
  appointment,
  onEdit,
  style,
  duration,
}: AppointmentCardProps) {
  const { startTime, endTime, client, service, notes } = appointment;

  return (
    <div style={style} className="z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={onEdit}
        className="h-full w-full cursor-pointer"
      >
        <Card className="appointment-card bg-primary z-20 text-sm h-full">
          <CardHeader
            className={cn(
              "p-2 pl-4 items-center h-full",
              duration < 60 && "flex-row"
            )}
          >
            <h4 className="font-medium truncate flex items-center gap-2">
              <p>{client.fullName}</p> <span> | </span>
              <p>{service.name}</p> <span> | </span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {format(startTime, "HH:mm", { locale: ptBR })} -{" "}
                  {format(endTime, "HH:mm", { locale: ptBR })}
                </span>
              </div>
            </h4>

            {notes && <p className="text-xs line-clamp-2">{notes}</p>}
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
