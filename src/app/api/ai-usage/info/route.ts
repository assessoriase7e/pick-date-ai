import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth } from "date-fns";
import { getAICreditsLimit, hasAIPlan } from "@/lib/subscription-limits";
import { isLifetimeUser } from "@/lib/lifetime-user";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    // Buscar usuário com informações de assinatura
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é usuário lifetime
    const isLifetime = await isLifetimeUser();
    
    // Obter limite de créditos de IA (incluindo adicionais)
    const monthlyLimit = await getAICreditsLimit(user.subscription, true, userId);
    
    // Verificar se tem plano de IA
    const hasAI = await hasAIPlan(user.subscription);

    // Calcular datas do mês atual
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Buscar atendimentos únicos do mês atual
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

    // Buscar créditos adicionais ativos
    const additionalCredits = await prisma.additionalAICredit.findMany({
      where: {
        userId,
        active: true,
        used: { lt: prisma.additionalAICredit.fields.quantity }
      }
    });

    // Calcular total de créditos adicionais disponíveis
    const totalAdditionalCredits = additionalCredits.reduce((total, credit) => {
      return total + (credit.quantity - credit.used);
    }, 0);

    // Calcular créditos restantes do plano base (sem considerar adicionais)
    const baseCreditsLimit = await getAICreditsLimit(user.subscription, true);
    const remainingBaseCredits = Math.max(0, baseCreditsLimit - uniqueAttendances);

    // Calcular créditos restantes totais (base + adicionais)
    const remainingCredits = remainingBaseCredits + totalAdditionalCredits;

    // Informações sobre o plano
    const planInfo = {
      isLifetime,
      hasAIPlan: hasAI,
      planType: user.subscription?.stripeProductId || "free",
      planStatus: user.subscription?.status || "inactive",
      additionalCredits: totalAdditionalCredits,
    };

    return NextResponse.json({
      success: true,
      data: {
        uniqueAttendances,
        totalAttendances,
        monthlyLimit: isLifetime ? Infinity : monthlyLimit,
        remainingCredits: isLifetime ? Infinity : remainingCredits,
        planInfo,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar informações de uso de IA:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}