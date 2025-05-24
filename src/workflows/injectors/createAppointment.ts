import { prisma } from "@/lib/db";
import { devConsoleLog } from "@/utils/devConsoleLog";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const createAppointmentInjector = async ({
  toolCall,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  instance: string;
}) => {
  devConsoleLog("Create Appointment");

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

  const newAppointment = await prisma.appointment.create({
    data: { ...args, userId: user.id },
  });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      newAppointment,
    }),
  };
};
