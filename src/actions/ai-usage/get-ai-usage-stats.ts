"use server";

import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { isLifetimeUser } from "@/lib/lifetime-user";
import { getAICreditsLimit } from "@/lib/subscription-limits";

type GetAIUsageStatsResponse =
  | {
      success: true;
      data: {
        uniqueAttendances: number;
        totalAttendances: number;
        monthlyLimit: number;
        remainingCredits: number;
        additionalCredits: {
          id: number;
          quantity: number;
          used: number;
          remaining: number;
          // expiresAt removido
        }[];
        totalAdditionalCredits: number;
      };
    }
  | { success: false; error: string };

// Remover a função getAICreditsLimit local, agora importada de @/lib/subscription-limits

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
        additionalAICredits: {
          where: {
            active: true,
            used: { lt: prisma.additionalAICredit.fields.quantity },
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    const clerkUser = await currentUser();
    const monthlyLimit = await getAICreditsLimit(user.subscription);

    // Calcular total de créditos adicionais
    const additionalCredits = user.additionalAICredits || [];
    const totalAdditionalCredits = additionalCredits.reduce(
      (total, credit) => total + (credit.quantity - credit.used),
      0
    );

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
          additionalCredits: [],
          totalAdditionalCredits: 0,
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

    // Calcular créditos restantes do plano base
    const baseRemainingCredits = Math.max(0, monthlyLimit - uniqueAttendances);

    // Calcular créditos restantes totais (plano base + adicionais)
    const remainingCredits = baseRemainingCredits + totalAdditionalCredits;

    return {
      success: true,
      data: {
        uniqueAttendances,
        totalAttendances,
        monthlyLimit,
        remainingCredits,
        additionalCredits: additionalCredits.map((credit) => ({
          id: credit.id,
          quantity: credit.quantity,
          used: credit.used,
          remaining: credit.quantity - credit.used,
        })),
        totalAdditionalCredits,
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
