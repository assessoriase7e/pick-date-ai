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
            include: { professional: true },
          });

          records.forEach((record: any) => {
            unifiedRecords.push({
              ...record,
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
      records: unifiedRecords,
      total: unifiedRecords.length,
    });
  } catch (error) {
    console.error("Error fetching professional records:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional records" },
      { status: 500 }
    );
  }
}
