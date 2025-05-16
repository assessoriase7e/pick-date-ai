import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

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

    const calendar = await prisma.calendar.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        collaborator: true,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Erro ao buscar calendário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar calendário" },
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

    const body = await req.json();
    const { name, collaboratorId } = body;

    const calendar = await prisma.calendar.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendário não encontrado" },
        { status: 404 }
      );
    }

    const updatedCalendar = await prisma.calendar.update({
      where: { id: params.id },
      data: {
        name,
        collaboratorId,
      },
      include: {
        collaborator: true,
      },
    });

    return NextResponse.json(updatedCalendar);
  } catch (error) {
    console.error("Erro ao atualizar calendário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar calendário" },
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

    const calendar = await prisma.calendar.findFirst({
      where: {
        id: params.id,
        userId: userProfile.user.id,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendário não encontrado" },
        { status: 404 }
      );
    }

    await prisma.calendar.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir calendário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir calendário" },
      { status: 500 }
    );
  }
}
