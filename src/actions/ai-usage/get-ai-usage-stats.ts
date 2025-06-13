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
      };
    }
  | { success: false; error: string };

export async function getAIUsageStats(): Promise<GetAIUsageStatsResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
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

    return {
      success: true,
      data: {
        uniqueAttendances,
        totalAttendances,
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