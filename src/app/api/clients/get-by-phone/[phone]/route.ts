import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const client = await prisma.client.findMany({
      where: { phone: params.phone },
    });
    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar cliente por telefone" },
      { status: 500 }
    );
  }
}
