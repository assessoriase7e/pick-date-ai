import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  let userId: string | undefined = undefined;
  if (validationResult.isMaster) {
    userId = searchParams.get("userId") || undefined;
  } else {
    userId = validationResult.userId;
  }

  try {
    const where = userId ? { id: userId } : {};
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { profile: true },
        where,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    let { id, email, firstName, lastName, imageUrl, profile, userId } = body;

    if (validationResult.isMaster) {
      id = userId || id;
    }

    if (!id || !email) {
      return NextResponse.json(
        { error: "ID e email são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        id,
        email,
        firstName,
        lastName,
        imageUrl,
        profile: profile
          ? {
              create: profile,
            }
          : undefined,
      },
      include: { profile: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
