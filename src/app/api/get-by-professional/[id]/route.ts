import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { getPrismaModelNames } from "@/mocked/models";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const modelNames = getPrismaModelNames();
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);

  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id: professionalId } = await params;

    const unifiedRecords: any[] = [];

    for (const modelName of modelNames) {
      try {
        try {
          // @ts-ignore
          const records = await prisma[modelName].findMany({
            where: { professionalId },
          });

          records.forEach((record: any) => {
            const standardizedRecord = { ...record };

            // Find any base64 field and standardize it
            for (const key in standardizedRecord) {
              if (
                key.endsWith("Base64") ||
                key.toLowerCase().includes("base64")
              ) {
                // Create the standardized base64 field
                standardizedRecord.base64 = standardizedRecord[key];
                // Remove the original field to avoid duplication
                delete standardizedRecord[key];
              }
            }

            unifiedRecords.push({
              ...standardizedRecord,
              type: modelName,
            });
          });
        } catch (queryError: any) {
          if (
            queryError.message &&
            queryError.message.includes("professionalId")
          ) {
          } else {
            throw queryError;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${modelName}:`, error);
      }
    }

    return NextResponse.json({
      data: unifiedRecords,
    });
  } catch (error) {
    console.error("Error fetching professional records:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional records" },
      { status: 500 }
    );
  }
}
