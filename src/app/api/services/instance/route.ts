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

    const services = await prisma.service.findMany({
      where: { userId: evolutionInstance.userId },
      select: {
        id: true,
        name: true,
        serviceCollaborators: {
          select: {
            collaborator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Formatar os serviços para leitura por IA
    const formattedResponse = formatServicesForAI(services);
    
    return NextResponse.json({ data: services, formatted: formattedResponse });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}

// Função para formatar serviços para leitura por IA
function formatServicesForAI(services: any[]) {
  if (!services || services.length === 0) {
    return "Não há serviços disponíveis.";
  }

  let formattedText = `Encontrei ${services.length} serviços disponíveis:\n\n`;

  services.forEach((service, index) => {
    formattedText += `${index + 1}. Serviço: ${service.name} (ID: ${service.id})\n`;
    
    if (service.serviceCollaborators && service.serviceCollaborators.length > 0) {
      formattedText += "   Profissionais que realizam este serviço:\n";
      service.serviceCollaborators.forEach((sc: any) => {
        if (sc.collaborator) {
          formattedText += `   - ${sc.collaborator.name}\n`;
        }
      });
    } else {
      formattedText += "   Não há profissionais específicos para este serviço.\n";
    }
    
    formattedText += "\n";
  });

  return formattedText;
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, price, availableDays, notes, durationMinutes, commission } =
      body;

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

    const service = await prisma.service.create({
      data: {
        name,
        price,
        availableDays,
        notes,
        durationMinutes,
        commission,
        userId: evolutionInstance.userId,
      },
      include: {
        serviceCollaborators: {
          include: {
            collaborator: true,
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}
