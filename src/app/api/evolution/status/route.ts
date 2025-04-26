import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const instanceName = searchParams.get("instanceName");

  if (!instanceName) {
    return NextResponse.json(
      { error: "Nome da instância é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/fetchInstances`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.EVOLUTION_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao verificar status da instância" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Resposta inesperada da API" },
        { status: 500 }
      );
    }

    const instance = data.find(
      (item: any) => item?.instance?.instanceName === instanceName
    );

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ instance });
  } catch (error) {
    console.error("Erro ao buscar instância:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar instância" },
      { status: 500 }
    );
  }
}
