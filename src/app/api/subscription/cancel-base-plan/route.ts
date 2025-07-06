import { cancelBasePlan } from "@/actions/subscription/cancel-base-plan";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await cancelBasePlan();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error cancelling base plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}