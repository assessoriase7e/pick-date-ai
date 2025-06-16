"use server";

import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { isLifetimeUser } from "@/lib/lifetime-user";

type GetAIUsageStatsResponse =
  | {
      success: true;
      data: {
        uniqueAttendances: number;
        totalAttendances: number;
        monthlyLimit: number;
        remainingCredits: number;
      };
    }
  | { success: false; error: string };

// Função para obter o limite de créditos baseado na assinatura
const getAICreditsLimit = async (subscription: any, user?: any): Promise<number> => {
  const isLifeTime = await isLifetimeUser();

  if (user && isLifeTime) {
    console.log("Usuário lifetime");
    return Infinity; // Usuários lifetime têm créditos ilimitados
  }

  if (!subscription || subscription.status !== "active") {
    return 0; // Sem assinatura = sem créditos
  }

  const { stripePriceId } = subscription;

  // Verificar pelos IDs dos produtos de IA
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!) {
    return 100;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!) {
    return 200;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!) {
    return 300;
  }

  return 0; // Outros planos não têm créditos de IA
};

export async function getAIUsageStats(): Promise<GetAIUsageStatsResponse> {
  const { userId } = await auth();
  const isLifetime = await isLifetimeUser();

  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    const clerkUser = await currentUser();
    const monthlyLimit = await getAICreditsLimit(user.subscription, clerkUser);

    // Se for usuário lifetime, retornar valores especiais
    if (clerkUser && isLifetime) {
      const currentMonth = new Date();
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const [uniqueAttendances, totalAttendances] = await Promise.all([
        prisma.aIUsage
          .findMany({
            where: {
              userId,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            distinct: ["clientPhone"],
          })
          .then((results) => results.length),
        prisma.aIUsage.count({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          uniqueAttendances,
          totalAttendances,
          monthlyLimit: Infinity,
          remainingCredits: Infinity,
        },
      };
    }

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Buscar atendimentos únicos do mês atual usando groupBy
    const uniqueAttendancesResult = await prisma.aIUsage.groupBy({
      by: ["clientPhone"],
      where: {
        userId,
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    const uniqueAttendances = uniqueAttendancesResult.length;

    // Buscar total de atendimentos do mês atual
    const totalAttendances = await prisma.aIUsage.count({
      where: {
        userId,
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // Calcular créditos restantes
    const remainingCredits = Math.max(0, monthlyLimit - uniqueAttendances);

    return {
      success: true,
      data: {
        uniqueAttendances,
        totalAttendances,
        monthlyLimit,
        remainingCredits,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de uso de IA:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}
