import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import moment from "moment";

export async function GET(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid || !validationResult.isMaster) {
      return new NextResponse("Acesso restrito à master key", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "O parâmetro 'date' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const appointments = await prisma.appointment.findMany({
      where: {
        AND: [
          {
            startTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          { status: "scheduled" },
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        collaborator: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            profile: {
              select: {
                companyName: true,
              },
            },
            evolutionInstances: {
              select: {
                apiKey: true,
                type: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
