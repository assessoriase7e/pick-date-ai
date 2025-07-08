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
    const instanceName = searchParams.get("instance-name");

    if (!instanceName) {
      return NextResponse.json(
        { error: "O parâmetro 'instance-name' é obrigatório na URL" },
        { status: 400 }
      );
    }

    // Query baseada na SQL fornecida
    const companyDetails = await prisma.evolutionInstance.findFirst({
      where: {
        name: instanceName,
        type: "attendant"
      },
      include: {
        user: {
          include: {
            profile: true,
            attendantPrompts: true,
            redisKeys: true
          }
        }
      }
    });

    if (!companyDetails) {
      return NextResponse.json(
        { error: "Instância não encontrada ou não é do tipo attendant" },
        { status: 404 }
      );
    }

    // Formatando a resposta conforme a estrutura da query SQL
    const response = {
      // Dados do perfil da empresa
      profile: {
        id: companyDetails.user.profile?.id,
        whatsapp: companyDetails.user.profile?.whatsapp,
        companyName: companyDetails.user.profile?.companyName,
        businessHours: companyDetails.user.profile?.businessHours,
        address: companyDetails.user.profile?.address,
        locationUrl: companyDetails.user.profile?.locationUrl,
        documentNumber: companyDetails.user.profile?.documentNumber,
        timezone: companyDetails.user.profile?.timezone,
        userId: companyDetails.user.profile?.userId
      },
      
      // Dados da instância Evolution (attendant)
      attendant: {
        id: companyDetails.id,
        name: companyDetails.name,
        number: companyDetails.number,
        webhookUrl: companyDetails.webhookUrl,
        apiKey: companyDetails.apiKey,
        status: companyDetails.status,
        type: companyDetails.type,
        userId: companyDetails.userId,
        createdAt: companyDetails.createdAt,
        updatedAt: companyDetails.updatedAt
      },
      
      // Dados do prompt do attendant
      prompt: companyDetails.user.attendantPrompts ? {
        id: companyDetails.user.attendantPrompts.id,
        content: companyDetails.user.attendantPrompts.content,
        isActive: companyDetails.user.attendantPrompts.isActive,
        createdAt: companyDetails.user.attendantPrompts.createdAt,
        updatedAt: companyDetails.user.attendantPrompts.updatedAt,
        presentation: companyDetails.user.attendantPrompts.presentation,
        speechStyle: companyDetails.user.attendantPrompts.speechStyle,
        expressionInterpretation: companyDetails.user.attendantPrompts.expressionInterpretation,
        schedulingScript: companyDetails.user.attendantPrompts.schedulingScript,
        rules: companyDetails.user.attendantPrompts.rules,
        formattedContent: companyDetails.user.attendantPrompts.formattedContent,
        suportPhone: companyDetails.user.attendantPrompts.suportPhone
      } : null,
      
      // Chaves Redis do attendant
      attendantRedisKeys: companyDetails.user.redisKeys.map(rk => rk.key)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar detalhes da empresa:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes da empresa" },
      { status: 500 }
    );
  }
}