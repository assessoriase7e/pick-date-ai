import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { createClientDataInjection } from "./createClient";

export const toolHandlers: Record<
  string,
  (args: {
    toolCall: any;
    phone: string;
    instance: string;
  }) => Promise<ChatCompletionMessageParam>
> = {
  createClient: ({ toolCall, phone, instance }) => {
    return createClientDataInjection({ toolCall, phone, instance });
  },

  getClient: () => {
    return;
  },
};
