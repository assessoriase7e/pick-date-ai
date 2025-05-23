import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getCollabWorkHoursInjector = async ({
  toolCall,
}: {
  toolCall: ChatCompletionMessageToolCall;
}) => {
  devConsoleLog("Get collab Work Hours");

  const args = JSON.parse(toolCall.function.arguments);

  console.log(args);

  const collab = await prisma.collaborator.findFirst({
    where: { id: args.collaboratorId },
    select: {
      workingHours: true,
      id: true,
      name: true,
      description: true,
      profession: true,
    },
  });

  console.log(collab);

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      collab,
    }),
  };
};
