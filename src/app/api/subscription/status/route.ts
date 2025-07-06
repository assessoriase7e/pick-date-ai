import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/services/subscription-service";

export async function GET() {
  const headers = {
    "Cache-Control": "max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  };

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    const subscriptionData = await getSubscriptionStatus();
    return NextResponse.json(subscriptionData, { headers });
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
