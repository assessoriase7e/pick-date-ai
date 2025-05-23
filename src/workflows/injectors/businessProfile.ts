import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getBusinessProfileInjector = async ({
  toolCall,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  instance: string;
}) => {
  devConsoleLog("Get business profile");

  const businessProfile = await prisma.profile.findFirst({
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
      id: true,
      userId: true,
      documentNumber: true,
      timezone: true,
    },
  });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      businessProfile,
    }),
  };
};
