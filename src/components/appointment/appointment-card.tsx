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
  const { startTime, endTime, client, service } = appointment;

  return (
    <div style={style} className="z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={onEdit}
        className="cursor-pointer h-full"
      >
        <Card className="z-20 text-sm h-full flex justify-center border-none bg-primary p-0 rounded-none">
          <CardHeader className={cn("p-0 pl-4 rounded-none")}>
            <h4 className="font-medium truncate flex gap-2 text-background dark:text-foreground text-xs lg:text-md h-full z-50">
              <p>{getShortName(client?.fullName) || "Cliente Deletado"}</p>{" "}
              <span> | </span>
              <p>{service?.name}</p>{" "}
              <span className="hidden lg:block"> | </span>
              <div className="hidden lg:flex">
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
