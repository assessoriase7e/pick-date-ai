"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const redisKeySchema = z.object({
  userId: z.string(),
  key: z.string(),
});

export async function saveRedisKey(data: z.infer<typeof redisKeySchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const existingKey = await prisma.redisKey.findFirst({
      where: {
        userId,
      },
    });

    let redisKey;

    if (existingKey) {
      redisKey = await prisma.redisKey.update({
        where: {
          id: existingKey.id,
        },
        data: {
          key: data.key,
        },
      });
    } else {
      redisKey = await prisma.redisKey.create({
        data: {
          userId: data.userId,
          key: data.key,
        },
      });
    }

    return {
      success: true,
      data: redisKey,
    };
  } catch (error) {
    console.error("[REDIS_KEY_SAVE]", error);
    return {
      success: false,
      error: "Falha ao salvar chave Redis",
    };
  }
}

export async function getRedisKey(userId: string) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const redisKey = await prisma.redisKey.findFirst({
      where: {
        userId,
      },
    });

    return {
      success: true,
      data: {
        redisKey,
      },
    };
  } catch (error) {
    console.error("[REDIS_KEY_GET]", error);
    return {
      success: false,
      error: "Falha ao buscar chave Redis",
    };
  }
}
