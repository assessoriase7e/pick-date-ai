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
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json(
        { error: "O parâmetro 'serviceId' é obrigatório na URL" },
        { status: 400 }
      );
    }

    // Primeiro, buscar o serviço para verificar se existe e obter o userId
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Buscar os colaboradores associados a este serviço
    const serviceCollaborators = await prisma.serviceCollaborator.findMany({
      where: { serviceId },
      select: { collaboratorId: true },
    });

    const collaboratorIds = serviceCollaborators.map((sc) => sc.collaboratorId);

    // Buscar calendários ativos que pertencem ao mesmo usuário do serviço
    // e que estão associados aos colaboradores que oferecem este serviço
    const calendars = await prisma.calendar.findMany({
      where: {
        AND: [
          { userId: service.userId },
          { isActive: true },
          collaboratorIds.length > 0
            ? { collaboratorId: { in: collaboratorIds } }
            : {},
        ],
      },
      select: {
        id: true,
        collaborator: {
          where: {
            calendars: {
              some: {
                isActive: true,
              },
            },
          },
          select: {
            name: true,
          },
        },
        appointments: {
          where: { status: "scheduled" },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Erro ao buscar calendários por serviço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar calendários por serviço" },
      { status: 500 }
    );
  }
}
