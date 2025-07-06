import { NextResponse } from "next/server";
import { cancelSubscription } from "@/services/subscription-service";

export async function POST() {
  try {
    const result = await cancelSubscription();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}