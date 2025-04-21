import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/api-key-utils";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalApiKeys = await prisma.apiKey.count({ where: { userId } });
    const totalPages = Math.ceil(totalApiKeys / limit);

    return NextResponse.json({ apiKeys, totalPages, currentPage: page });
  } catch (error) {
    console.error("[API_KEYS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { description } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiKey = generateApiKey();

    const newApiKey = await prisma.apiKey.create({
      data: {
        userId,
        key: apiKey,
        description,
      },
    });

    return NextResponse.json(newApiKey, { status: 201 });
  } catch (error) {
    console.error("[API_KEYS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
