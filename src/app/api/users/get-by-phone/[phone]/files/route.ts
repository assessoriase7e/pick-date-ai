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
      where: { whatsapp: paramsResolved.phone },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const [files, links] = await Promise.all([
      prisma.fileRecord.findMany({
        where: { userId: profile.user.id },
        select: { id: true, description: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.link.findMany({
        where: { userId: profile.user.id },
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
