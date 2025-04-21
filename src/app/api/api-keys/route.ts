import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/api-key-utils";

// GET: Listar chaves de API do usuário logado
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Paginação (opcional, mas recomendado para muitas chaves)
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10; // Ou outro valor desejado
    const skip = (page - 1) * limit;

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalApiKeys = await prisma.apiKey.count({ where: { userId } });
    const totalPages = Math.ceil(totalApiKeys / limit);

    return NextResponse.json({ apiKeys, totalPages, currentPage: page });
  } catch (error) {
    console.error("[API_KEYS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Criar uma nova chave de API
export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // Obtém o userId da sessão do Clerk
    const { description } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiKey = generateApiKey(); // Gera uma chave segura

    const newApiKey = await prisma.apiKey.create({
      // O erro ocorre aqui
      data: {
        userId, // Este userId não existe na tabela User
        key: apiKey,
        description,
      },
    });

    // Retorne a chave completa APENAS na criação. Não a exponha novamente.
    return NextResponse.json(newApiKey, { status: 201 });
  } catch (error) {
    console.error("[API_KEYS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
