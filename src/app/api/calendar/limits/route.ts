import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { isLifetimeUser } from "@/lib/lifetime-user";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar usuário do Clerk para verificar metadados
    const clerkUser = await currentUser();
    const isLifetime = clerkUser ? await isLifetimeUser() : false;

    // Se for usuário lifetime, retornar limites ilimitados
    if (isLifetime) {
      const currentCalendars = await prisma.calendar.count({
        where: { userId },
      });

      return NextResponse.json({
        limit: Infinity,
        current: currentCalendars,
        canCreateMore: true,
        isAiPlan: true, // Considerar como plano AI para funcionalidades
        hasAdditionalCalendars: true,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        calendars: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const current = user.calendars.length;
    const limit = await getCalendarLimit(user.subscription, clerkUser);
    const isAiPlan = await isAiSubscription(user.subscription, clerkUser);
    const hasAdditionalCalendars = hasAdditionalCalendarSubscription(user.subscription);

    return NextResponse.json({
      limit,
      current,
      canCreateMore: current < limit,
      isAiPlan,
      hasAdditionalCalendars,
    });
  } catch (error) {
    console.error("[CALENDAR_LIMITS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getCalendarLimit(subscription: any, user?: any): Promise<number> {
  // Verificar se é usuário lifetime primeiro
  if (user && await isLifetimeUser()) {
    return Infinity;
  }

  if (!subscription || subscription.status !== "active") {
    return 3;
  }

  const { stripePriceId } = subscription;

  if (
    [
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
    ].includes(stripePriceId)
  ) {
    return Infinity;
  }

  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!) {
    return 13;
  }

  return 3;
}

async function isAiSubscription(subscription: any, user?: any): Promise<boolean> {
  // Usuários lifetime são considerados como tendo plano AI
  if (user && await isLifetimeUser()) {
    return true;
  }

  if (!subscription || subscription.status !== "active") {
    return false;
  }

  return [
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
  ].includes(subscription.stripePriceId);
}

function hasAdditionalCalendarSubscription(subscription: any): boolean {
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  return subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!;
}
