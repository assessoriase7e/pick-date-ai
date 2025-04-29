import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
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
