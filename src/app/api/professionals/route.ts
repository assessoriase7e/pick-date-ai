import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils"; // Importar a função de validação

export async function GET(req: NextRequest) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  try {
    const [professionals, totalCount] = await Promise.all([
      prisma.professional.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.professional.count(),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      professionals,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching professionals:", error)
    return NextResponse.json({ error: "Failed to fetch professionals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Validar API Key
  const apiKeyHeader = req.headers.get('Authorization');
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json()
    const { name, phone, company } = body

    if (!name || !phone || !company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const professional = await prisma.professional.create({
      data: {
        name,
        phone,
        company,
      },
    })

    return NextResponse.json(professional, { status: 201 })
  } catch (error) {
    console.error("Error creating professional:", error)
    return NextResponse.json({ error: "Failed to create professional" }, { status: 500 })
  }
}
