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
    const phone = searchParams.get("phone");

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

    // Se o número de telefone for fornecido, busca apenas o cliente específico
    if (phone) {
      const client = await prisma.client.findFirst({
        where: {
          phone,
          userId: evolutionInstance.userId,
        },
      });

      const formattedResponse = client 
        ? `Cliente encontrado: ${client.fullName}, telefone: ${client.phone}${client.notes ? `, observações: ${client.notes}` : ''}`
        : "Nenhum cliente encontrado com este número de telefone.";

      return NextResponse.json({ data: client, formatted: formattedResponse });
    }

    // Caso contrário, retorna todos os clientes
    const clients = await prisma.client.findMany({
      where: { userId: evolutionInstance.userId },
    });

    // Formatar os clientes para leitura por IA
    const formattedResponse = formatClientsForAI(clients);
    
    return NextResponse.json({ data: clients, formatted: formattedResponse });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

// Função para formatar clientes para leitura por IA
function formatClientsForAI(clients: any[]) {
  if (!clients || clients.length === 0) {
    return "Não há clientes cadastrados.";
  }

  let formattedText = `Encontrei ${clients.length} clientes cadastrados:\n\n`;

  clients.forEach((client, index) => {
    formattedText += `${index + 1}. Nome: ${client.fullName}\n`;
    formattedText += `   Telefone: ${client.phone}\n`;
    
    if (client.birthDate) {
      const birthDate = new Date(client.birthDate);
      formattedText += `   Data de Nascimento: ${birthDate.toLocaleDateString('pt-BR')}\n`;
    }
    
    if (client.notes) {
      formattedText += `   Observações: ${client.notes}\n`;
    }
    
    formattedText += "\n";
  });

  return formattedText;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
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

    // Obtenha os dados do corpo da requisição
    const body = await req.json();

    // Extraia os outros dados do corpo
    const { fullName, birthDate, phone, notes } = body;

    const existingClient = await prisma.client.findFirst({
      where: {
        phone,
        userId: evolutionInstance.userId,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { message: "Cliente já cadastrado" },
        { status: 200 }
      );
    }

    const client = await prisma.client.create({
      data: {
        fullName,
        phone,
        birthDate,
        notes,
        userId: evolutionInstance.userId,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
