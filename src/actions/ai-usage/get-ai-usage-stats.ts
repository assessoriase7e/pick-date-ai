"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";

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
function getAICreditsLimit(subscription: any): number {
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
}

export async function getAIUsageStats(): Promise<GetAIUsageStatsResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Buscar usuário com assinatura
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

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Buscar atendimentos únicos do mês atual usando groupBy
    const uniqueAttendancesResult = await prisma.aIUsage.groupBy({
      by: ['clientPhone'],
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

    // Obter limite baseado na assinatura
    const monthlyLimit = getAICreditsLimit(user.subscription);
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
    console.error("Erro ao buscar estatísticas de uso da IA:", error);
    return {
      success: false,
      error: "Falha ao buscar estatísticas de uso da IA",
    };
  }
}