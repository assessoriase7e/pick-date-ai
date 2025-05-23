import { getChatHistory, saveMessageToHistory } from "@/utils/redis";
import OpenAI from "openai/index.mjs";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const runAgent = async ({
  sessionId,
  system,
  user,
  tools = [],
}: {
  sessionId: string;
  system: string;
  user: string;
  tools?: ChatCompletionTool[];
}) => {
  // Recupera histórico anterior
  const history = await getChatHistory(sessionId);

  // Mensagens para a nova chamada
  const messages = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: user },
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini-2025-04-14",
    messages,
    tool_choice: "auto",
    tools,
  });

  const response = res.choices[0].message;

  // Salva nova interação no histórico
  await saveMessageToHistory(sessionId, "user", user);
  if (response.content) {
    await saveMessageToHistory(sessionId, "assistant", response.content);
  }

  return {
    llmRes: response.content,
    tool_calls: response.tool_calls,
  };
};
