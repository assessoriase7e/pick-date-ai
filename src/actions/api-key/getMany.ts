"use server";

import { prisma } from "@/lib/db";
import { ApiKey } from "@prisma/client";

interface GetApiKeysResponse {
  apiKeys: ApiKey[];
  totalPages: number;
  currentPage: number;
}

export async function getApiKeys(
  page: number = 1,
  limit: number = 10
): Promise<GetApiKeysResponse> {
  const skip = (page - 1) * limit;

  try {
    const [apiKeys, total] = await Promise.all([
      prisma.apiKey.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.apiKey.count(),
    ]);

    return {
      apiKeys,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Erro ao listar chaves de API:", error);
    throw new Error("Falha ao listar chaves de API");
  }
}