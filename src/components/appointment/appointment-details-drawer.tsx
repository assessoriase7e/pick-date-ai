import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AppointmentFullData } from "@/types/calendar";
import { AppointmentDetailsCard } from "./appointment-details-card";
import moment from "moment";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppointmentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentFullData[];
  date: moment.Moment | null;
}

export function AppointmentDetailsDrawer({
  isOpen,
  onClose,
  appointments,
  date,
}: AppointmentDetailsDrawerProps) {
  if (!date) return null;

  const formattedDate = date.format("DD [de] MMMM");
  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== "canceled"
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Agendamentos para {formattedDate}</DrawerTitle>
        </DrawerHeader>
        {activeAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Não há agendamentos para este dia
          </p>
        ) : (
          <ScrollArea className="h-[50vh] px-4">
            <div className="space-y-2 pr-4">
              {activeAppointments.map((appointment) => (
                <AppointmentDetailsCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DrawerContent>
    </Drawer>
  );
}