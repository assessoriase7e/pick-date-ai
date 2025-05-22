import { EvolutionData } from "@/types/evolutionData";
import { messageBuffer } from "../utils/messageBuffer";
import { getFormattedAttendantPrompt } from "@/utils/attendantPrompt";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { sendAgentMessage } from "../utils/sendMessage";
import { llmWithTools } from "@/lib/langchain";
import { RunnableSequence } from "@langchain/core/runnables";

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

    //Get Prompt
    const prompt = await getFormattedAttendantPrompt({
      instanceName: body.instance,
    });

    // Set agent
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", prompt!],
      ["user", "{topic}"],
    ]);

    const chain = RunnableSequence.from([promptTemplate, llmWithTools]);

    const result = await chain.invoke({ topic: fullMessage });

    sendAgentMessage({
      text: result.content as string,
      instance: body.instance,
      number,
    });
  } catch (error) {
    console.log(error);
  }
};
