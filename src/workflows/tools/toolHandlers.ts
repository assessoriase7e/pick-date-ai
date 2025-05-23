import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index.mjs";
import { createClientDataInjection } from "./createClient";
import { getClientDataInjection } from "./getClient";

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

type ToolHandlers = {
  createClient: (args: CreateClientArgs) => Promise<ChatCompletionMessageParam>;
  getClient: (args: GetClientArgs) => Promise<ChatCompletionMessageParam>;
};

export const toolHandlers: ToolHandlers = {
  createClient: ({ toolCall, phone, instance }) => {
    return createClientDataInjection({ toolCall, phone, instance });
  },

  getClient: ({ phone, instance, toolCall }) => {
    return getClientDataInjection({ phone, instance, toolCall });
  },
};
