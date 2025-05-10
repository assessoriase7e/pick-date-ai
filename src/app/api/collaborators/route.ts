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

    const collaborators = await prisma.collaborator.findMany({
      where: { userId: userProfile.user.id },
      include: {
        calendars: {
          select: {
            id: true,
            name: true,
          },
        },
        ServiceCollaborator: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                availableDays: true,
                notes: true,
                durationMinutes: true,
                commission: true,
                isActive: true,
              }
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
    const { name, phone, profession, description, workingHours } = body;

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

    const collaborator = await prisma.collaborator.create({
      data: {
        name,
        phone,
        profession,
        description,
        workingHours,
        userId: userProfile.user.id,
      },
      include: {
        calendars: true,
        ServiceCollaborator: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(collaborator, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao criar colaborador" },
      { status: 500 }
    );
  }
}
