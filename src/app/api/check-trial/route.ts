import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ hasAccess: false });
    }

    // Verificar período de teste (3 dias)
    const trialEndDate = new Date(user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const isTrialActive = new Date() < trialEndDate;

    // Se trial ainda está ativo, permitir acesso
    if (isTrialActive) {
      return NextResponse.json({ hasAccess: true });
    }

    // Se trial expirou, verificar assinatura
    const subscription = user.subscription;
    const hasActiveSubscription = subscription && ["active", "trialing"].includes(subscription.status);

    return NextResponse.json({ hasAccess: hasActiveSubscription });
  } catch (error) {
    console.error('Erro ao verificar trial:', error);
    // Em caso de erro, permitir acesso
    return NextResponse.json({ hasAccess: true });
  }
}