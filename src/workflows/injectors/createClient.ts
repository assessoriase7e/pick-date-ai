import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const createClientInjector = async ({
  toolCall,
  phone,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  phone: string;
  instance: string;
}) => {
  devConsoleLog("Create Client");

  const args = JSON.parse(toolCall.function.arguments);

  const user = await prisma.user.findFirst({
    where: {
      evolutionInstances: {
        some: {
          name: instance,
        },
      },
    },
  });

  const data = {
    ...args,
    phone: phone || args.phone,
    userId: user.id,
  };

  const client = await prisma.client.create({ data });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      name: client.fullName,
    }),
  };
};
