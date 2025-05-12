import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { phone } = await params;
    const body = await req.json();
    const { fullName, birthDate, notes } = body;

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
        { status: 204 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { phone, userId: userProfile.user.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        fullName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        notes,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { phone } = await params;
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

    const client = await prisma.client.findFirst({
      where: { phone, userId: userProfile.user.id },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}
