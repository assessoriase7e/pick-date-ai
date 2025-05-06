"use client";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";
import { PublicDayScheduleGrid } from "./public-day-schedule-grid";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";

interface PublicDayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  appointments: AppointmentFullData[];
  closeDayDetails: () => void;
  selectedHour: number | null;
  onHourClick: (hour: number) => void;
}

export function PublicDayDetailsModal({
  dayDetails,
  appointments,
  closeDayDetails,
  selectedHour,
  onHourClick,
}: PublicDayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formattedDate = moment(dayDetails.date).format(
    "DD [de] MMMM [de] YYYY"
  );

  if (isMobile) {
    return (
      <Drawer open={dayDetails.isOpen} onOpenChange={closeDayDetails}>
        <DrawerContent className="max-w-xl h-svh p-0 flex flex-col">
          <DrawerHeader className="p-2 flex items-center justify-center pt-10">
            <DrawerTitle className="text-xl">
              Horários disponíveis para {formattedDate}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto">
            <PublicDayScheduleGrid
              appointments={appointments}
              onHourClick={onHourClick}
              selectedHour={selectedHour}
              selectedDate={String(dayDetails.date)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={dayDetails.isOpen} onOpenChange={closeDayDetails}>
      <DialogContent className="max-w-xl h-svh lg:h-[80svh] p-0 flex flex-col">
        <DialogHeader className="p-2 flex items-center justify-center pt-10">
          <DialogTitle className="text-xl">
            Horários disponíveis para {formattedDate}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <PublicDayScheduleGrid
            appointments={appointments}
            onHourClick={onHourClick}
            selectedHour={selectedHour}
            selectedDate={String(dayDetails.date)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
