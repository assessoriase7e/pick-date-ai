import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Revalidar o cache da assinatura
    revalidateTag("subscription-status");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false, message: "Erro ao revalidar", error },
      { status: 500 }
    );
  }
}