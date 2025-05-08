import { AppointmentFullData } from "@/types/calendar";

export interface AppointmentFormProps {
  date: Date;
  appointment?: AppointmentFullData;
  onSuccess: () => void;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => boolean;
  initialStartTime?: string;
  initialEndTime?: string;
  calendarId: string;
}
