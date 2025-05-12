import { NextRequest, NextResponse } from "next/server";
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
    const businessPhone = searchParams.get("business-phone");

    if (!businessPhone) {
      return NextResponse.json(
        { error: "O parâmetro 'business-phone' é obrigatório na URL" },
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

    const calendars = await prisma.calendar.findMany({
      where: { AND: [{ userId: userProfile.user.id }, { isActive: true }] },
      include: {
        collaborator: true,
      },
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Erro ao buscar calendários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar calendários" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessPhone = searchParams.get("business-phone");

    if (!businessPhone) {
      return NextResponse.json(
        { error: "O parâmetro 'business-phone' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, collaboratorId } = body;

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

    const calendar = await prisma.calendar.create({
      data: {
        name,
        collaboratorId,
        userId: userProfile.user.id,
      },
      include: {
        collaborator: true,
      },
    });

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar calendário:", error);
    return NextResponse.json(
      { error: "Erro ao criar calendário" },
      { status: 500 }
    );
  }
}
