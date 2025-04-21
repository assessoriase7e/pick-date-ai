import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const professional = await prisma.professional.findFirst({
      where: { phone: params.phone },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error("Error fetching professional:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional" },
      { status: 500 }
    );
  }
}
