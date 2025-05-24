import { redis } from "@/lib/redis";

const getHistoryKey = (sessionId: string) => `chat:history:${sessionId}`;

export const saveMessageToHistory = async (
  sessionId: string,
  role: "user" | "system" | "assistant",
  content: string | object
) => {
  const key = getHistoryKey(sessionId);

  // Se content for string e for JSON válido, converte para objeto:
  let contentToSave = content;
  if (typeof content === "string") {
    try {
      contentToSave = JSON.parse(content);
    } catch {
      // não é JSON, salva como string mesmo
      contentToSave = content;
    }
  }

  const message = JSON.stringify({ role, content: contentToSave });
  await redis.rpush(key, message);
  await redis.expire(key, 43200);
};

export const getChatHistory = async (sessionId: string) => {
  const key = getHistoryKey(sessionId);
  const messages = await redis.lrange(key, 0, -1);
  return messages.map((m) => JSON.parse(m));
};

export const clearChatHistory = async (sessionId: string) => {
  const key = getHistoryKey(sessionId);
  await redis.del(key);
};
