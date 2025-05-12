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
  const instance = searchParams.get("instance");

  if (!instance) {
    return NextResponse.json(
      { error: "Instância não fornecida" },
      { status: 400 }
    );
  }

  try {
    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: { name: instance },
      include: { user: true },
    });

    if (!evolutionInstance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    const [files, links] = await Promise.all([
      prisma.fileRecord.findMany({
        where: { userId: evolutionInstance.userId },
        select: { id: true, description: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.link.findMany({
        where: { userId: evolutionInstance.userId },
        select: { id: true, description: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      files,
      links,
      totalFiles: files.length + links.length,
    });
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return NextResponse.json(
      { error: "Falha ao buscar arquivos" },
      { status: 500 }
    );
  }
}
