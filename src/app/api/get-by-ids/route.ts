import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { getPrismaModelNames } from "@/mocked/models";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const modelNames = getPrismaModelNames();

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

    const recordsPromises = modelNames.map(async (modelName) => {
      // @ts-ignore: acesso dinâmico ao Prisma
      const records = await prisma[modelName].findMany({
        where: { id: { in: ids } },
        include: { professional: true },
      });

      return records.map((record: any) => ({
        ...record,
        type: modelName,
      }));
    });

    const results = await Promise.all(recordsPromises);
    const allRecordsFlat = results.flat();

    if (!allRecordsFlat.length) {
      return NextResponse.json(
        { error: "No records found with the provided IDs" },
        { status: 404 }
      );
    }

    // Aplica filtros se solicitado
    let filtered = allRecordsFlat;
    if (requestedFields.length > 0) {
      filtered = allRecordsFlat.map((record: any) => {
        const filteredRecord: any = {};
        requestedFields.forEach((field) => {
          if (field in record) {
            filteredRecord[field] = record[field];
          }
        });
        if (!requestedFields.includes("id") && "id" in record) {
          filteredRecord.id = record.id;
        }
        if (!requestedFields.includes("type")) {
          filteredRecord.type = record.type;
        }
        return filteredRecord;
      });
    }

    return NextResponse.json({
      total: allRecordsFlat.length,
      records: filtered,
    });
  } catch (error) {
    console.error("Error fetching records by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
