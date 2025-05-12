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
    const date = searchParams.get("date");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Data não fornecida" },
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

    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: evolutionInstance.userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: true,
        service: true,
        calendar: true,
        collaborator: true,
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