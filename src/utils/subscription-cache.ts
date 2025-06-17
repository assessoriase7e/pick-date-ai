import { redis } from "@/lib/redis";

const CACHE_TTL = 21600; // 6 horas em segundos
const getCacheKey = (userId: string) => `subscription:status:${userId}`;

export const getSubscriptionFromCache = async (userId: string) => {
  try {
    const key = getCacheKey(userId);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Erro ao buscar cache de assinatura:", error);
    return null;
  }
};

export const setSubscriptionCache = async (userId: string, data: any) => {
  try {
    const key = getCacheKey(userId);
    await redis.setex(key, CACHE_TTL, JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao salvar cache de assinatura:", error);
  }
};

export const invalidateSubscriptionCache = async (userId: string) => {
  try {
    const key = getCacheKey(userId);
    await redis.del(key);
  } catch (error) {
    console.error("Erro ao invalidar cache de assinatura:", error);
  }
};
