import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const paramsResolved = await params;

  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const prompts = await prisma.prompt.findMany({
      where: { userId: paramsResolved.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!prompts || prompts.length === 0) {
      return NextResponse.json({ error: "Prompts não encontrados" }, { status: 404 });
    }

    // Adicionar campo formattedContent para cada prompt
    const promptsWithFormattedContent = prompts.map(prompt => {
      let formattedContent = "";
      
      // Para prompts do tipo Atendente, formatar com hashtags
      if (prompt.type === "Atendente") {
        const attendantPrompt = prompt as any; // Casting para acessar os campos específicos
        
        formattedContent = `#Apresentação\n${attendantPrompt.presentation || ""}\n\n` +
                          `#Estilo da Fala\n${attendantPrompt.speechStyle || ""}\n\n` +
                          `#Interpretação de Expressões\n${attendantPrompt.expressionInterpretation || ""}\n\n` +
                          `#Script de Agendamento\n${attendantPrompt.schedulingScript || ""}\n\n` +
                          `#Regras\n${attendantPrompt.rules || ""}`;
      } else {
        // Para outros tipos de prompts, manter o conteúdo original
        formattedContent = prompt.content;
      }
      
      return {
        ...prompt,
        formattedContent
      };
    });

    return NextResponse.json(promptsWithFormattedContent);
  } catch (error) {
    console.error("Erro ao buscar prompts:", error);
    return NextResponse.json(
      { error: "Falha ao buscar prompts" },
      { status: 500 }
    );
  }
}