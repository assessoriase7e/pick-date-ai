import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id: params.id,
      },
      include: {
        calendars: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            appointments: {
              omit: {
                createdAt: true,
                updatedAt: true,
                collaboratorId: true,
              },
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                    durationMinutes: true,
                    availableDays: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
        ServiceCollaborator: {
          where: {
            service: {
              isActive: true,
            },
          },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                notes: true,
                durationMinutes: true,
                availableDays: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(collaborator);
  } catch (error) {
    console.error("Erro ao buscar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaborador" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id: params.id,
        userId: userProfile.user.id,
      },
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    const updatedCollaborator = await prisma.collaborator.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        profession,
        description,
        workingHours,
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

    return NextResponse.json(updatedCollaborator);
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar colaborador" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id: params.id,
        userId: userProfile.user.id,
      },
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    await prisma.collaborator.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao excluir colaborador" },
      { status: 500 }
    );
  }
}
