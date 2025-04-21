import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils"; // Importar a função de validação

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const paramsResolved = await params;

  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const image = await prisma.imageRecord.findMany({
      where: { professionalId: paramsResolved.id },
      include: {
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
