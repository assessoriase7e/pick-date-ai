import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/actions/subscription/get-subscription-status";

export async function GET() {
  try {
    const subscriptionData = await getSubscriptionStatus();
    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
