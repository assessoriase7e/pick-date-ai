import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index.mjs";
import { getBusinessProfileInjector } from "./businessProfile";
import { getClientInjector } from "./getClient";
import { createClientInjector } from "./createClient";
import { getServicesInjector } from "./getServices";
import { getCollabsInjector } from "./getCollabs";
import { getCollabWorkHoursInjector } from "./getCollabWorkHours";
import { getCollabCalendarTimesInjector } from "./getCollabCalendarTimes";
import { createAppointmentInjector } from "./createAppointment";

type CreateClientArgs = {
  toolCall: ChatCompletionMessageToolCall;
  phone: string;
  instance: string;
};

type GetClientArgs = {
  toolCall: ChatCompletionMessageToolCall;
  phone: string;
  instance: string;
};

type GetBusinessArgs = {
  instance: string;
  toolCall: ChatCompletionMessageToolCall;
};

type GetServicesArgs = {
  instance: string;
  toolCall: ChatCompletionMessageToolCall;
};

type GetCollabsArgs = {
  instance: string;
  toolCall: ChatCompletionMessageToolCall;
};

type GetCollabWorkHoursArgs = {
  instance: string;
  toolCall: ChatCompletionMessageToolCall;
};

type CreateAppointmentArgs = {
  instance: string;
  toolCall: ChatCompletionMessageToolCall;
};

type ToolInjectors = {
  createClient: (args: CreateClientArgs) => Promise<ChatCompletionMessageParam>;

  getClient: (args: GetClientArgs) => Promise<ChatCompletionMessageParam>;

  getBusinessProfile: (
    args: GetBusinessArgs
  ) => Promise<ChatCompletionMessageParam>;

  getServices: (args: GetServicesArgs) => Promise<ChatCompletionMessageParam>;

  getCollabs: (args: GetCollabsArgs) => Promise<ChatCompletionMessageParam>;

  getCollabWorkHours: (
    args: GetCollabWorkHoursArgs
  ) => Promise<ChatCompletionMessageParam>;

  getCollabCalendarTimes: (
    args: GetCollabWorkHoursArgs
  ) => Promise<ChatCompletionMessageParam>;

  createAppointment: (
    args: CreateAppointmentArgs
  ) => Promise<ChatCompletionMessageParam>;
};

export const toolInjectors: ToolInjectors = {
  createClient: createClientInjector,
  getClient: getClientInjector,
  getBusinessProfile: getBusinessProfileInjector,
  getServices: getServicesInjector,
  getCollabs: getCollabsInjector,
  getCollabWorkHours: getCollabWorkHoursInjector,
  getCollabCalendarTimes: getCollabCalendarTimesInjector,
  createAppointment: createAppointmentInjector,
};
