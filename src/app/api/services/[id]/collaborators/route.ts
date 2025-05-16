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

    const serviceCollaborators = await prisma.serviceCollaborator.findMany({
      where: {
        serviceId: params.id,
        service: {
          userId: userProfile.user.id,
        },
      },
      include: {
        collaborator: {
          select: {
            id: true,
            name: true,
            workingHours: true,
            description: true,
            phone: true,
            profession: true,
            ServiceCollaborator: {
              select: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    durationMinutes: true,
                    commission: true,
                    availableDays: true,
                    notes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(serviceCollaborators);
  } catch (error) {
    console.error("Erro ao buscar colaboradores do serviço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaboradores do serviço" },
      { status: 500 }
    );
  }
}
