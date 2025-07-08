import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key-utils";
import { validateContactForAgent } from "@/utils/contact-validation";
import { getUserByInstanceName } from "@/actions/agents/get-user-by-instance";
import { z } from "zod";

const validateContactSchema = z.object({
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
  contactPhone: z.string().min(1, "Telefone do contato é obrigatório"),
  fromMe: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // Validar API Key
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Validar body da requisição
    const body = await req.json();

    const { instanceName, contactPhone, fromMe } = body;

    // Buscar usuário pela instância
    const userId = await getUserByInstanceName(instanceName);

    if (!userId) {
      return NextResponse.json({ error: "Instância não encontrada" }, { status: 404 });
    }

    // Validar se o contato pode ser atendido
    const result = await validateContactForAgent(userId, contactPhone, instanceName, fromMe);

    return NextResponse.json({
      canAttend: result.canAttend,
      reason: result.reason,
      pauseUntil: result.pauseUntil,
    });
  } catch (error) {
    console.error("Erro na validação de contato:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
