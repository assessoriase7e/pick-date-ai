import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getServicesInjector = async ({
  toolCall,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  instance: string;
}) => {
  devConsoleLog("Get services");

  const services = await prisma.service.findMany({
    where: {
      user: {
        evolutionInstances: {
          some: {
            name: instance,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      isActive: true,
      price: true,
      availableDays: true,
      serviceCollaborators: {
        select: {
          collaborator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      services,
    }),
  };
};
