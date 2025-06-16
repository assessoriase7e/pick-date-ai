import { AppointmentFullData } from "@/types/calendar";

interface PublicAppointmentCardProps {
  appointment: AppointmentFullData;
  onClick: (appointment: AppointmentFullData) => void;
  height: number;
}

export function PublicAppointmentCard({ appointment, onClick, height }: PublicAppointmentCardProps) {
  return (
    <div
      className="bg-primary p-2 flex flex-col justify-center cursor-pointer rounded"
      style={{ height: `${height}px`, minHeight: "20px" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(appointment);
      }}
    >
      <div className="flex items-center gap-2 text-sm "></div>
      <h4 className="font-medium truncate flex items-center gap-2 text-background dark:text-foreground text-xs lg:text-md">
        <p>{appointment.client?.fullName || "Cliente Deletado"}</p> <span> | </span>
        <p>{appointment.service.name}</p>{" "}
      </h4>
    </div>
  );
}
