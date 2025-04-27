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
  const userId = searchParams.get("userId");

  try {
    if (userId) {
      const attendantPrompt = await prisma.attendantPrompt.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      return NextResponse.json({
        attendantPrompt,
      });
    }

    // Se não houver userId, retornar erro
    return NextResponse.json(
      { error: "UserId é obrigatório" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao buscar prompts do atendente:", error);
    return NextResponse.json(
      { error: "Falha ao buscar prompts do atendente" },
      { status: 500 }
    );
  }
}
