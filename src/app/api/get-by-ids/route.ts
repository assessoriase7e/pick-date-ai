import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = searchParams.getAll("id");

  if (!ids.length) {
    return NextResponse.json(
      { error: "At least one ID must be provided" },
      { status: 400 }
    );
  }

  try {
    const requestedFields = Array.from(searchParams.keys()).filter(
      (key) => key !== "id"
    );

    // Lista de buscas em múltiplas tabelas
    const results = await Promise.all([
      prisma.audioRecord.findMany({
        where: { id: { in: ids } },
        include: { professional: true },
      }),
      prisma.documentRecord.findMany({
        where: { id: { in: ids } },
        include: { professional: true },
      }),
      prisma.imageRecord.findMany({
        where: { id: { in: ids } },
        include: { professional: true },
      }),
    ]);

    const allRecords = results.flat();

    if (!allRecords.length) {
      return NextResponse.json(
        { error: "No records found with the provided IDs" },
        { status: 404 }
      );
    }

    // Filtrar os campos, se necessário
    let filtered = allRecords;
    if (requestedFields.length > 0) {
      filtered = allRecords.map(
        (record: { id: string; [key: string]: any }) => {
          const filteredRecord: any = {};
          requestedFields.forEach((field) => {
            if (field in record) {
              filteredRecord[field] = record[field as keyof typeof record];
            }
          });
          if (!requestedFields.includes("id") && "id" in record) {
            filteredRecord.id = record.id;
          }
          return filteredRecord;
        }
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching records by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
