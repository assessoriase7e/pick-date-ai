import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const [audios, totalCount] = await Promise.all([
      prisma.audioRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          professional: true,
        },
      }),
      prisma.audioRecord.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      audios,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching audios:", error);
    return NextResponse.json(
      { error: "Failed to fetch audios" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { professionalId, description, audioBase64 } = body;

    if (!professionalId || !description || !audioBase64) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const audio = await prisma.audioRecord.create({
      data: {
        audioBase64,
        description,
        professionalId,
      },
      include: {
        professional: true,
      },
    });

    return NextResponse.json(audio, { status: 201 });
  } catch (error) {
    console.error("Error creating audio:", error);
    return NextResponse.json(
      { error: "Failed to create audio" },
      { status: 500 }
    );
  }
}
