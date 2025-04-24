import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const paramsResolved = await params;
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const profile = await prisma.profile.findFirst({
      where: { phone: paramsResolved.phone },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: profile.user.id },
      include: { profile: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
