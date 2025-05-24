import { createAppointmentTool } from "./createAppointment";
import { createClientTool } from "./createClient";
import { getBusinessProfileTool } from "./getBusiness";
import { getClientTool } from "./getClient";
import { getCollabCalendarTimesTool } from "./getCollabCalendar";
import { getCollabsTool } from "./getCollabs";
import { getCollabWorkHoursTool } from "./getCollabWorkHours";
import { getServicesTool } from "./getServices";

export const agentTools = [
  createClientTool,
  getClientTool,
  getBusinessProfileTool,
  getServicesTool,
  getCollabsTool,
  getCollabWorkHoursTool,
  getCollabCalendarTimesTool,
  createAppointmentTool,
];
