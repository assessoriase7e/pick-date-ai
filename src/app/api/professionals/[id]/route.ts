import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils"; // Importar a função de validação

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const professional = await prisma.professional.findUnique({
      where: { id: params.id },
    })

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 })
    }

    return NextResponse.json(professional)
  } catch (error) {
    console.error("Error fetching professional:", error)
    return NextResponse.json({ error: "Failed to fetch professional" }, { status: 500 })
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
    const { name, phone, company } = body

    if (!name && !phone && !company) {
      return NextResponse.json({ error: "At least one field must be provided" }, { status: 400 })
    }

    const professional = await prisma.professional.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(company && { company }),
      },
    })

    return NextResponse.json(professional)
  } catch (error) {
    console.error("Error updating professional:", error)
    return NextResponse.json({ error: "Failed to update professional" }, { status: 500 })
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
    await prisma.professional.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting professional:", error)
    return NextResponse.json({ error: "Failed to delete professional" }, { status: 500 })
  }
}
