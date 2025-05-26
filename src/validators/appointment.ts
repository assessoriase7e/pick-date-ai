import { AppointmentFullData } from "@/types/calendar";

export interface AppointmentFormProps {
  date: Date;
  appointment?: AppointmentFullData;
  onSuccess: () => void;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: number
  ) => boolean;
  initialStartTime?: string;
  initialEndTime?: string;
  calendarId: number;
}
