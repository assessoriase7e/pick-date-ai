import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  // Validar API Key
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      prisma.imageRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.imageRecord.count(),
    ]);

    return NextResponse.json({
      images,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Error fetching images" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Validar API Key
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageBase64, description, userId } = body;

    if (!imageBase64 || !description || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const image = await prisma.imageRecord.create({
      data: {
        imageBase64,
        description,
        userId,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json(
      { error: "Error creating image" },
      { status: 500 }
    );
  }
}
