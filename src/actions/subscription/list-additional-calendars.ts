"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export interface AdditionalCalendarData {
  id: number;
  active: boolean;
  stripeSubscriptionId: number | null;
  purchaseDate: Date;
  cancelAtPeriodEnd?: boolean;
}

export async function listAdditionalCalendars(): Promise<AdditionalCalendarData[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const additionalCalendars = await prisma.additionalCalendar.findMany({
      where: { userId },
      orderBy: { purchaseDate: "desc" },
    });

    // Para cada calendário, verificar status no Stripe se necessário
    const calendarsWithStatus = await Promise.all(
      additionalCalendars.map(async (calendar) => {
        let cancelAtPeriodEnd = false;

        if (calendar.stripeSubscriptionId && calendar.active) {
          try {
            const { stripe } = await import("@/lib/stripe");
            const subscription = await stripe.subscriptions.retrieve(calendar.stripeSubscriptionId);
            cancelAtPeriodEnd = subscription.cancel_at_period_end;
          } catch (error) {
            console.error("Error fetching Stripe subscription:", error);
          }
        }

        return {
          id: calendar.id,
          active: calendar.active,
          stripeSubscriptionId: calendar.stripeSubscriptionId,
          purchaseDate: calendar.purchaseDate,
          cancelAtPeriodEnd,
        };
      })
    );

    return calendarsWithStatus.map((calendar) => ({
      ...calendar,
      stripeSubscriptionId: calendar.stripeSubscriptionId ? Number(calendar.stripeSubscriptionId) : null,
    }));
  } catch (error) {
    console.error("Error listing additional calendars:", error);
    throw error;
  }
}
