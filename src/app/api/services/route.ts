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

    const services = await prisma.service.findMany({
      where: { userId: userProfile.user.id },
      include: {
        serviceCollaborators: {
          include: {
            collaborator: true,
          },
        },
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
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
    const {
      name,
      price,
      availableDays,
      notes,
      collaboratorId,
      durationMinutes,
      commission,
    } = body;

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

    const service = await prisma.service.create({
      data: {
        name,
        price,
        availableDays,
        notes,
        durationMinutes,
        commission,
        userId: userProfile.user.id,
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
