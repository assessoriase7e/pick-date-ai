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
    const sessionId = body.data.key.remoteJid + "_temp";

    const fullMessage = await messageBuffer({
      remoteId: body.instance,
      newMessage: message,
      delayInSeconds: 0,
    });

    if (!fullMessage) return;

    const systemPrompt = await getFormattedAttendantPrompt({
      instanceName: body.instance,
    });

    // Salva a mensagem do usuário no histórico
    await saveMessageToHistory(sessionId, "user", fullMessage);

    const { llmRes, tool_calls } = await runAgent({
      sessionId,
      system: `Data de hoje: ${moment().date()}
      \n
      ${systemPrompt}
      `,
      user: fullMessage,
      tools: agentTools.map((t) => ({ type: "function", function: t })),
    });

    if (!tool_calls?.length) {
      // Se não houver chamadas de ferramentas, salva a resposta direta do assistente
      await saveMessageToHistory(sessionId, "assistant", llmRes);
      await sendAgentMessage({
        text: llmRes,
        instance: body.instance,
        number: clientPhone,
      });
      return;
    }

    // Salva a mensagem do assistente com as chamadas de ferramentas E a resposta textual
    await saveMessageToHistory(
      sessionId,
      "assistant",
      JSON.stringify({
        content: llmRes,
        tool_calls: tool_calls,
      })
    );

    const validToolsResults: ChatCompletionMessageParam[] = await Promise.all(
      tool_calls
        .filter((toolCall) => toolInjectors[toolCall.function.name])
        .map(async (toolCall) => {
          const result = await toolInjectors[toolCall.function.name]({
            toolCall,
            phone: clientPhone,
            instance: body.instance,
          });
          // Salva o resultado da ferramenta no histórico com formato padronizado
          if (result)
            await saveMessageToHistory(
              sessionId,
              "assistant",
              JSON.stringify({
                tool_call_id: toolCall.id,
                function: { name: toolCall.function.name },
                content: result,
              })
            );
          return result;
        })
    );

    const messagesForFollowUp: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: fullMessage },
      {
        role: "assistant",
        content: llmRes,
        tool_calls,
      },
      ...validToolsResults,
    ];

    const finalMessage = await openai.chat.completions.create({
      model: "gpt-4.1-mini-2025-04-14",
      messages: messagesForFollowUp,
    });

    const finalContent =
      finalMessage.choices[0].message?.content ?? "Tudo certo!";

    // Salva a resposta final do assistente
    await saveMessageToHistory(sessionId, "assistant", finalContent);

    await sendAgentMessage({
      text: finalContent,
      instance: body.instance,
      number: clientPhone,
    });
  } catch (error) {
    console.error("Erro no agente:", error);
  }
};
