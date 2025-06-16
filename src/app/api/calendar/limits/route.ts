import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        calendars: {
          where: { isActive: true }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const current = user.calendars.length;
    const limit = getCalendarLimit(user.subscription);
    const isAiPlan = isAiSubscription(user.subscription);
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getCalendarLimit(subscription: any): number {
  if (!subscription || subscription.status !== "active") {
    return 3;
  }

  const { stripePriceId } = subscription;
  
  if ([
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
  ].includes(stripePriceId)) {
    return Infinity;
  }
  
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!) {
    return 13;
  }
  
  return 3;
}

function isAiSubscription(subscription: any): boolean {
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