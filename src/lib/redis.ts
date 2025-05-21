import Redis from "ioredis";

export const redis = new Redis({
  username: process.env.REDIS_USER || "default",
  host: process.env.REDIS_HOST || "localhost", // ou IP
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || "",
});
