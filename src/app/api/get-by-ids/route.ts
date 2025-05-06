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

  let userId: string | undefined = undefined;
  if (validationResult.isMaster) {
    userId = searchParams.get("userId") || undefined;
  } else {
    userId = validationResult.userId;
  }

  if (!ids.length) {
    return NextResponse.json(
      { error: "At least one ID must be provided" },
      { status: 400 }
    );
  }

  try {
    const fieldsParam = searchParams.get("fields");
    const requestedFields = fieldsParam
      ? fieldsParam.split(",")
      : Array.from(searchParams.keys()).filter((key) => key !== "id");

    const recordsPromises = modelNames.map(async (modelName) => {
      try {
        const where: any = { id: { in: ids } };
        if (userId) where.userId = userId;

        const records = await prisma[modelName].findMany({
          where,
          include: { professional: true },
        });

        return records.map((record: any) => {
          const standardizedRecord = { ...record };

          for (const key in standardizedRecord) {
            if (
              key.endsWith("Base64") ||
              key.toLowerCase().includes("base64")
            ) {
              standardizedRecord.base64 = standardizedRecord[key];
              delete standardizedRecord[key];
            }
          }

          return {
            ...standardizedRecord,
            type: modelName,
          };
        });
      } catch (error) {
        console.error(`Error fetching ${modelName}:`, error);
        return [];
      }
    });

    const results = await Promise.all(recordsPromises);
    const allRecordsFlat = results.flat();

    if (!allRecordsFlat.length) {
      return NextResponse.json(
        { error: "No records found with the provided IDs" },
        { status: 404 }
      );
    }

    let filtered = allRecordsFlat;
    if (requestedFields.length > 0) {
      filtered = allRecordsFlat.map((record: any) => {
        const filteredRecord: any = {};

        filteredRecord.id = record.id;
        filteredRecord.type = record.type;

        requestedFields.forEach((field) => {
          if (field in record) {
            filteredRecord[field] = record[field];
          }
        });

        if (record.base64) {
          filteredRecord.base64 = record.base64;
        }

        return filteredRecord;
      });
    }

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Error fetching records by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
