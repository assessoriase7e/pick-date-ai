import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { Prisma } from "@prisma/client";

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

  const url = new URL(req.url);
  const includeFields = url.searchParams.getAll("include");

  const buildInclude = (fields: string[]) => {
    const include: Prisma.UserInclude = {};
    for (const field of fields) {
      if (field === "evolution") {
        include.evolutionInstances = {
          omit: {
            qrCode: true,
          },
        };
      } else if (field === "profile") {
        include.profile = true;
      } else if (field === "redisKeys") {
        include.redisKeys = true;
      } else if (field === "attendant") {
        include.attendantPrompts = true;
      } else if (field === "sdr") {
        include.sdrPrompts = true;
      } else if (field === "followup") {
        include.followUpPrompts = true;
      }
    }

    return include;
  };

  try {
    const profile = await prisma.profile.findFirst({
      where: { whatsapp: paramsResolved.phone },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: profile.user.id },
      include: buildInclude(includeFields),
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
