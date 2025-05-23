import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index.mjs";
import { getBusinessProfileInjector } from "../injectors/businessProfile";
import { getClientInjector } from "../injectors/getClient";
import { createClientInjector } from "../injectors/createClient";

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

type ToolHandlers = {
  createClient: (args: CreateClientArgs) => Promise<ChatCompletionMessageParam>;
  getClient: (args: GetClientArgs) => Promise<ChatCompletionMessageParam>;
  getBusinessProfile: (
    args: GetBusinessArgs
  ) => Promise<ChatCompletionMessageParam>;
};

export const toolHandlers: ToolHandlers = {
  createClient: ({ toolCall, phone, instance }) => {
    return createClientInjector({ toolCall, phone, instance });
  },

  getClient: ({ phone, instance, toolCall }) => {
    return getClientInjector({ phone, instance, toolCall });
  },

  getBusinessProfile: ({ instance, toolCall }) => {
    return getBusinessProfileInjector({ instance, toolCall });
  },
};
