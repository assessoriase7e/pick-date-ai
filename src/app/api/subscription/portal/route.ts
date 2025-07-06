import { createPortalSession } from "@/actions/subscription/create-portal-session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await createPortalSession();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
