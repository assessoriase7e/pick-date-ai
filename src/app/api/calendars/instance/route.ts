import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 400 }
      );
    }

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

    const calendars = await prisma.calendar.findMany({
      where: { 
        AND: [
          { userId: evolutionInstance.userId },
          { isActive: true }
        ]
      },
      include: {
        collaborator: true,
      },
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Erro ao buscar calendários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar calendários" },
      { status: 500 }
    );
  }
}