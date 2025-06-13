import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  try {
    // Validar a chave de API
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Obter o userId do parâmetro de consulta
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "UserId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem o agente de atendimento ativo
    const attendantPrompt = await prisma.attendantPrompt.findFirst({
      where: { userId },
      select: { isActive: true },
    });

    // Retornar true se o agente estiver ativo, false caso contrário
    return NextResponse.json({
      isActive: attendantPrompt?.isActive || false,
    });
  } catch (error) {
    console.error("Erro ao verificar status do agente de atendimento:", error);
    return NextResponse.json(
      { error: "Falha ao verificar status do agente de atendimento" },
      { status: 500 }
    );
  }
}