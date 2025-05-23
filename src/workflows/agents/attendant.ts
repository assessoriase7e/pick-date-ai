import { EvolutionData } from "@/types/evolutionData";
import { messageBuffer } from "../utils/messageBuffer";
import { getFormattedAttendantPrompt } from "@/utils/attendantPrompt";
import { sendAgentMessage } from "../utils/sendMessage";
import { createChatRes } from "@/lib/openai";

export const attedantAgent = async ({
  body,
  message,
}: {
  body: EvolutionData;
  message: string;
}) => {
  try {
    const number = body.data.key.remoteJid.split("@")[0];

    const fullMessage = await messageBuffer({
      remoteId: body.instance,
      newMessage: message,
      delayInSeconds: 7,
    });

    if (!fullMessage) return;

    const systemPrompt = await getFormattedAttendantPrompt({
      instanceName: body.instance,
    });

    const { llmRes } = await createChatRes({
      system: systemPrompt,
      user: fullMessage,
    });

    await sendAgentMessage({
      text: llmRes,
      instance: body.instance,
      number,
    });
  } catch (error) {
    console.log(error);
  }
};
