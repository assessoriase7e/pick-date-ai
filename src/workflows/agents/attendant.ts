import { EvolutionData } from "@/types/evolutionData";
import { messageBuffer } from "../utils/messageBuffer";
import { getFormattedAttendantPrompt } from "@/utils/attendantPrompt";
import { sendAgentMessage } from "../utils/sendMessage";
import { openai, runAgent } from "@/lib/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { agentTools } from "../tools";
import { toolInjectors } from "../injectors";
import moment from "moment";
import { saveMessageToHistory } from "@/utils/redis";

export const attedantAgent = async ({
  body,
  message,
}: {
  body: EvolutionData;
  message: string;
}) => {
  try {
    const clientPhone = body.data.key.remoteJid.split("@")[0];

    const fullMessage = await messageBuffer({
      remoteId: body.instance,
      newMessage: message,
      delayInSeconds: 7,
    });

    if (!fullMessage) return;

    const systemPrompt = await getFormattedAttendantPrompt({
      instanceName: body.instance,
    });

    const { llmRes, tool_calls } = await runAgent({
      sessionId: body.data.key.remoteJid + "_temp",
      system: `Data de hoje: ${moment().date()}
      \n
      ${systemPrompt}
      `,
      user: fullMessage,
      tools: agentTools.map((t) => ({ type: "function", function: t })),
    });

    if (!tool_calls?.length) {
      await sendAgentMessage({
        text: llmRes,
        instance: body.instance,
        number: clientPhone,
      });
      return;
    }

    const validToolsResults: ChatCompletionMessageParam[] = await Promise.all(
      tool_calls
        .filter((toolCall) => toolInjectors[toolCall.function.name])
        .map(async (toolCall) => {
          const result = await toolInjectors[toolCall.function.name]({
            toolCall,
            phone: clientPhone,
            instance: body.instance,
          });
          if (result)
            await saveMessageToHistory(
              body.data.key.remoteJid + "_temp",
              "assistant",
              JSON.stringify(result)
            );
          return result;
        })
    );

    const messagesForFollowUp: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: fullMessage },
      {
        role: "assistant",
        tool_calls,
      },
      ...validToolsResults,
    ];

    const finalMessage = await openai.chat.completions.create({
      model: "gpt-4.1-mini-2025-04-14",
      messages: messagesForFollowUp,
    });

    await sendAgentMessage({
      text: finalMessage.choices[0].message?.content ?? "Tudo certo!",
      instance: body.instance,
      number: clientPhone,
    });
  } catch (error) {
    console.error("Erro no agente:", error);
  }
};
