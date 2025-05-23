import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getCollabsInjector = async ({
  toolCall,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  instance: string;
}) => {
  devConsoleLog("Get collabs");

  const collabs = await prisma.collaborator.findMany({
    where: {
      user: {
        evolutionInstances: {
          some: {
            name: instance,
          },
        },
      },
    },
    omit: {
      updatedAt: true,
      createdAt: true,
      userId: true,
    },
  });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      collabs,
    }),
  };
};
