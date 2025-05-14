import { NextRequest, NextResponse } from "next/server";
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
    const calendarId = searchParams.get("calendarId");
    const date = searchParams.get("date");

    if (!date || !calendarId) {
      return NextResponse.json(
        { error: "O parâmetro 'date' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const calendar = await prisma.calendar.findUnique({
      where: {
        id: calendarId,
        isActive: true,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        {
          message:
            "Calendário não encontrado. Profissional não possuí agenda ou está com agenda fechada",
        },
        { status: 200 }
      );
    }

    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const appointments = await prisma.appointment.findMany({
      where: {
        status: "scheduled",
        calendarId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: true,
        service: true,
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
