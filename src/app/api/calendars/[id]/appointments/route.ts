import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import moment from "moment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const businessPhone = searchParams.get("business-phone");
    const date = searchParams.get("date");

    if (!businessPhone) {
      return NextResponse.json(
        { error: "O parâmetro 'business-phone' é obrigatório na URL" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "O parâmetro 'date' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const userProfile = await prisma.profile.findFirst({
      where: { whatsapp: businessPhone },
      include: { user: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        {
          error: "Usuário não encontrado com este número de telefone comercial",
        },
        { status: 404 }
      );
    }

    const calendar = await prisma.calendar.findFirst({
      where: {
        id,
        userId: userProfile.user.id,
        isActive: true,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendário não encontrado. Profissional não possuí agenda." },
        { status: 204 }
      );
    }

    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const appointments = await prisma.appointment.findMany({
      where: {
        calendarId: id,
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
