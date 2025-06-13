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

    // Obter o nome da instância do parâmetro de consulta
    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 400 }
      );
    }

    // Buscar a instância e o usuário associado
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

    // Verificar se o usuário tem o agente de atendimento ativo
    const attendantPrompt = await prisma.attendantPrompt.findFirst({
      where: { userId: evolutionInstance.userId },
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