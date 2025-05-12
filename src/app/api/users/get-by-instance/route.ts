import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const includeFields = url.searchParams.getAll("include");

  const { searchParams } = new URL(req.url);
  const instance = searchParams.get("instance");

  if (!instance) {
    return NextResponse.json(
      { error: "Instância não fornecida" },
      { status: 400 }
    );
  }

  const buildInclude = (fields: string[]) => {
    const include: Prisma.UserInclude = {};
    for (const field of fields) {
      if (field === "evolution") {
        include.evolutionInstances = {
          omit: {
            qrCode: true,
          },
        };
      } else if (field === "profile") {
        include.profile = true;
      } else if (field === "redisKeys") {
        include.redisKeys = true;
      } else if (field === "attendant") {
        include.attendantPrompts = true;
      } else if (field === "sdr") {
        include.sdrPrompts = true;
      } else if (field === "followup") {
        include.followUpPrompts = true;
      }
    }
    return include;
  };

  try {
    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: { name: instance },
      include: { user: true },
    });

    if (!evolutionInstance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: evolutionInstance.userId },
      include: buildInclude(includeFields),
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Falha ao buscar usuário" },
      { status: 500 }
    );
  }
}
