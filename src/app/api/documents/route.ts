import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  // Validate API Key
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  let userId: string | undefined = undefined;
  if (validationResult.isMaster) {
    userId = searchParams.get("userId") || undefined;
  } else {
    userId = validationResult.userId;
  }

  try {
    const where = userId ? { userId } : {};
    const [documents, totalCount] = await Promise.all([
      prisma.documentRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where,
      }),
      prisma.documentRecord.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Add standardized base64 field to each document
    const responseDocuments = documents.map((doc) => ({
      ...doc,
      base64: doc.documentBase64,
    }));

    return NextResponse.json({
      documents: responseDocuments,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Validate API Key
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    let { userId, description, documentBase64, fileName, fileType } = body;

    if (validationResult.isMaster) {
      userId = userId || undefined;
    } else {
      userId = validationResult.userId;
    }

    if (!userId || !description || !documentBase64 || !fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const document = await prisma.documentRecord.create({
      data: {
        documentBase64,
        fileName,
        fileType,
        description,
        userId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
