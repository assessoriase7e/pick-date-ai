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

    const calendars = await prisma.calendar.findMany({
      where: { 
        AND: [
          { userId: evolutionInstance.userId },
          { isActive: true }
        ]
      },
      include: {
        collaborator: true,
      },
    });

    // Formatar os calendários para leitura por IA
    const formattedResponse = formatCalendarsForAI(calendars);
    
    return NextResponse.json({ data: calendars, formatted: formattedResponse });
  } catch (error) {
    console.error("Erro ao buscar calendários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar calendários" },
      { status: 500 }
    );
  }
}

// Função para formatar calendários para leitura por IA
function formatCalendarsForAI(calendars: any[]) {
  if (!calendars || calendars.length === 0) {
    return "Não há calendários disponíveis.";
  }

  let formattedText = `Encontrei ${calendars.length} calendários disponíveis:\n\n`;

  calendars.forEach((calendar, index) => {
    formattedText += `${index + 1}. Calendário: ${calendar.name || 'Sem nome'} (ID: ${calendar.id})\n`;
    
    if (calendar.collaborator) {
      formattedText += `   Profissional: ${calendar.collaborator.name}\n`;
    } else {
      formattedText += "   Sem profissional associado\n";
    }
    
    formattedText += "\n";
  });

  return formattedText;
}