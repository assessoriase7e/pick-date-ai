import { AppointmentFullData } from "@/types/calendar";
import React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import moment from "moment";
import { getShortName } from "@/utils/getShortName";

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
        <Card className=" z-20 text-sm h-full border-none">
          <CardHeader
            className={cn(
              "p-2 pl-4 items-center h-full bg-primary rounded-md ",
              duration < 60 && "flex-row"
            )}
          >
            <h4 className="font-medium truncate flex items-center gap-2 text-background dark:text-foreground text-xs lg:text-md">
              <p>{getShortName(client?.fullName) || "Cliente Deletado"}</p>{" "}
              <span> | </span>
              <p>{service.name}</p> <span className="hidden lg:block"> | </span>
              <div className="flex  items-center hidden lg:flex">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {moment(startTime).format("HH:mm")} -{" "}
                  {moment(endTime).format("HH:mm")}
                </span>
              </div>
            </h4>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
