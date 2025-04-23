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
    const paramsResolved = await params;
    const professionalId = paramsResolved.id;

    const recordsPromises = modelNames.map(async (modelName) => {
      try {
        // Check if the model has a professionalId field
        const dmmf = (prisma as any)._baseDmmf.modelMap[modelName];
        const hasProfessionalId = dmmf?.fields?.some(
          (field: any) => field.name === "professionalId"
        );

        if (!hasProfessionalId) {
          return []; // Skip models without professionalId
        }

        // @ts-ignore: acesso dinâmico ao Prisma
        const records = await prisma[modelName].findMany({
          where: { professionalId },
          include: { professional: true },
        });

        return records.map((record: any) => ({
          ...record,
          type: modelName,
        }));
      } catch (error) {
        console.error(`Error fetching ${modelName}:`, error);
        return []; // Return empty array for failed models
      }
    });

    const results = await Promise.all(recordsPromises);

    const allRecordsFlat = results.flat();

    const allRecordsGrouped = results.reduce(
      (acc: any, curr: any, i: number) => {
        acc[modelNames[i]] = curr;
        return acc;
      },
      {} as Record<string, any[]>
    );

    allRecordsGrouped.total = allRecordsFlat.length;
    allRecordsGrouped.records = allRecordsFlat;

    return NextResponse.json(allRecordsGrouped);
  } catch (error) {
    console.error("Error fetching professional records:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional records" },
      { status: 500 }
    );
  }
}
