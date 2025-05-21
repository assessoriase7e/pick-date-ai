import { redis } from "@/lib/redis";
import { wait } from "./wait";

interface MessageFlowParams {
  remoteId: string;
  newMessage: string;
  delayInSeconds: number;
}

export async function messageBuffer({
  remoteId,
  newMessage,
  delayInSeconds,
}: MessageFlowParams) {
  const redisKey = `${remoteId}_temp`;

  // Retrieve previously stored messages
  const oldMessages = await redis.lrange(redisKey, 0, -1);

  // Get the last stored message (last in the list)
  const lastMessage = oldMessages[oldMessages.length - 1] ?? "";

  // Skip if the new message is the same as the last one
  if (newMessage === lastMessage) return;

  // Store the new message
  await redis.rpush(redisKey, newMessage);

  // Wait for the configured delay
  await wait(delayInSeconds);

  // Retrieve messages again after the delay
  const messagesAfterDelay = await redis.lrange(redisKey, 0, -1);
  const fullMessage = messagesAfterDelay.join(", ");

  // Clear Redis key
  await redis.del(redisKey);

  return fullMessage;
}
