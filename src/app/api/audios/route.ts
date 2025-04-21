import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils"; // Importar a função de validação

export async function GET(req: NextRequest) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

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
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

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
