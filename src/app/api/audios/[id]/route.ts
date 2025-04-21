import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateApiKey } from "@/lib/api-key-utils"; // Importar a função de validação

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const audio = await prisma.audioRecord.findUnique({
      where: { id: params.id },
      include: {
        professional: true,
      },
    })

    if (!audio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 })
    }

    return NextResponse.json(audio)
  } catch (error) {
    console.error("Error fetching audio:", error)
    return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json()
    const { professionalId, description, audioBase64 } = body

    if (!professionalId && !description && !audioBase64) {
      return NextResponse.json({ error: "At least one field must be provided" }, { status: 400 })
    }

    const updateData: any = {}
    if (professionalId) updateData.professionalId = professionalId
    if (description) updateData.description = description
    if (audioBase64) updateData.audioBase64 = audioBase64

    const audio = await prisma.audioRecord.update({
      where: { id: params.id },
      data: updateData,
      include: {
        professional: true,
      },
    })

    return NextResponse.json(audio)
  } catch (error) {
    console.error("Error updating audio:", error)
    return NextResponse.json({ error: "Failed to update audio" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.audioRecord.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting audio:", error)
    return NextResponse.json({ error: "Failed to delete audio" }, { status: 500 })
  }
}
