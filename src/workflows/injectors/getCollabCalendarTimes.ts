import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getCollabCalendarTimesInjector = async ({
  toolCall,
}: {
  toolCall: ChatCompletionMessageToolCall;
}) => {
  devConsoleLog("Get collab Work Hours");

  const args = JSON.parse(toolCall.function.arguments);

  const collab = await prisma.collaborator.findFirst({
    where: { id: args.collaboratorId },
    select: {
      id: true,
      name: true,
      calendars: {
        omit: {
          createdAt: true,
          collaboratorId: true,
          accessCode: true,
        },
      },
    },
  });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      collab,
    }),
  };
};
