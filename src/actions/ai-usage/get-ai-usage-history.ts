"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { AIUsage, Prisma } from "@prisma/client";

type AIUsageWithClient = AIUsage & {
  client?: {
    fullName: string;
  } | null;
};

type GetAIUsageHistoryResponse =
  | {
      success: true;
      data: AIUsageWithClient[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type SortOptions = {
  field?: string;
  direction?: "asc" | "desc";
};

type GetAIUsageHistoryProps = {
  where?: Prisma.AIUsageWhereInput;
  page?: number;
  limit?: number;
  sort?: SortOptions;
  search?: string;
};

export async function getAIUsageHistory({
  page = 1,
  limit = 50,
  sort,
  search,
  where,
}: GetAIUsageHistoryProps = {}): Promise<GetAIUsageHistoryResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const skip = (page - 1) * limit;

    let orderBy: any = { date: "desc" };

    if (sort?.field) {
      orderBy = {
        [sort.field]: sort.direction || "desc",
      };
    }

    // Construir a query where
    const finalWhere: Prisma.AIUsageWhereInput = { ...where, userId };

    // Se tiver busca por telefone
    if (search) {
      finalWhere.clientPhone = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [aiUsages, total] = await Promise.all([
      prisma.aIUsage.findMany({
        where: finalWhere,
        orderBy,
        skip,
        take: limit,
        // Remove the problematic include
      }),
      prisma.aIUsage.count({
        where: finalWhere,
      }),
    ]);

    // Buscar clientes para cada telefone
    const aiUsagesWithClients = await Promise.all(
      aiUsages.map(async (usage) => {
        const client = await prisma.client.findFirst({
          where: {
            phone: usage.clientPhone,
            userId,
          },
          select: {
            fullName: true,
          },
        });

        return {
          ...usage,
          client,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: aiUsagesWithClients,
      pagination: {
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar histórico de uso da IA:", error);
    return {
      success: false,
      error: "Falha ao buscar histórico de uso da IA",
    };
  }
}