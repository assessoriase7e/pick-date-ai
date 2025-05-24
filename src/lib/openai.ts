import { getChatHistory, saveMessageToHistory } from "@/utils/redis";
import OpenAI from "openai/index.mjs";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const MAX_HISTORY_LENGTH = 20;

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

  const limitedHistory = history.slice(-MAX_HISTORY_LENGTH);

  // Mensagens para a nova chamada
  const messages = [
    { role: "system", content: system },
    ...limitedHistory,
    { role: "user", content: user },
  ];

  const sanitizedMessages = messages.map(({ role, content }) => {
    if (typeof content === "object") {
      // Se for objeto (como resposta da ferramenta), converte para string JSON
      return {
        role,
        content: JSON.stringify(content),
      };
    }
    // Caso já seja string, retorna direto
    return { role, content };
  });

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: sanitizedMessages,
    tool_choice: "auto",
    tools,
    temperature: 0.3,
  });

  const response = res.choices[0].message;

  // Salva apenas a mensagem do usuário no histórico
  await saveMessageToHistory(sessionId, "user", user);
  // Removido o salvamento da resposta do assistente aqui

  return {
    llmRes: response.content,
    tool_calls: response.tool_calls,
  };
};
