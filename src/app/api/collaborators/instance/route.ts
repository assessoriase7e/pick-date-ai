import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import moment from "moment";

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

    const collaborators = await prisma.collaborator.findMany({
      where: {
        AND: [
          { userId: evolutionInstance.userId },
          {
            calendars: {
              some: {
                isActive: true,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        profession: true,
        description: true,
        calendars: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        },
        workingHours: true,
        Appointment: {
          where: {
            AND: [
              { status: "scheduled" },
              { startTime: { gte: moment().startOf("day").toISOString() } },
            ],
          },
        },
        ServiceCollaborator: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
                availableDays: true,
                price: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaboradores" },
      { status: 500 }
    );
  }
}
