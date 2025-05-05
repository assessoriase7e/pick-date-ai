import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { EvolutionInstance } from "@prisma/client";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");

  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const phone = searchParams.get("phone");

  try {
    let attendantPrompt = null;
    let ragConfig = null;
    let evolutionInstances = [] as Partial<EvolutionInstance>[];
    let resolvedUserId = null;

    if (userId) {
      resolvedUserId = userId;
      attendantPrompt = await prisma.attendantPrompt.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });
    } else if (phone) {
      // Busca o perfil pelo telefone
      const profile = await prisma.profile.findFirst({
        where: { whatsapp: phone },
        include: { user: true },
      });

      if (profile && profile.userId) {
        resolvedUserId = profile.userId;
        attendantPrompt = await prisma.attendantPrompt.findUnique({
          where: { userId: profile.userId },
          include: {
            user: true,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: "UserId ou phone é obrigatório" },
        { status: 400 }
      );
    }

    if (resolvedUserId) {
      ragConfig = await prisma.ragConfig.findUnique({
        where: { userId: resolvedUserId },
      });
      evolutionInstances = await prisma.evolutionInstance.findMany({
        where: { userId: resolvedUserId },
        orderBy: { createdAt: "desc" },
        select: {
          name: true,
          number: true,
          webhookUrl: true,
          userId: true,
          status: true,
          id: true,
        },
      });
    }

    if (!attendantPrompt) {
      return NextResponse.json(
        { error: "Prompt do atendente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      attendantPrompt,
      ragConfig,
      evolutionInstances,
    });
  } catch (error) {
    console.error("Erro ao buscar prompts do atendente:", error);
    return NextResponse.json(
      { error: "Falha ao buscar prompts do atendente" },
      { status: 500 }
    );
  }
}
