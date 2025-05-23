import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getClientInjector = async ({
  toolCall,
  phone,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  phone: string;
  instance: string;
}) => {
  devConsoleLog("Get Client");

  const client = await prisma.client.findFirst({
    where: {
      AND: [
        { phone },
        {
          user: {
            evolutionInstances: {
              some: {
                name: instance,
              },
            },
          },
        },
      ],
    },
    select: {
      fullName: true,
      birthDate: true,
      phone: true,
      notes: true,
    },
  });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      client,
    }),
  };
};
