import { type NextRequest, NextResponse } from "next/server";
import { getClients } from "@/actions/clients/get-clients";
import { saveClient } from "@/actions/clients/save-client";

export async function GET(req: NextRequest) {
  // Listar todos os clientes
  const result = await getClients();
  if (result.success && result.data) {
    return NextResponse.json(result.data.clients);
  }
  return NextResponse.json({ error: result.error }, { status: 500 });
}

export async function POST(req: NextRequest) {
  // Criar um novo cliente
  try {
    const data = await req.json();
    const result = await saveClient(data);
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 201 });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
