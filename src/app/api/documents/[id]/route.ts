import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const document = await prisma.documentRecord.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const responseDocument = {
      ...document,
      base64: document.documentBase64,
    };

    return NextResponse.json(responseDocument);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { description, userId, documentBase64, fileName, fileType } = body;

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (userId !== undefined) updateData.userId = userId;
    if (documentBase64 !== undefined)
      updateData.documentBase64 = documentBase64;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (fileType !== undefined) updateData.fileType = fileType;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update provided" },
        { status: 400 }
      );
    }

    const document = await prisma.documentRecord.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: true,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.documentRecord.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
