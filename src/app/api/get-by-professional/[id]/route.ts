import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { getPrismaModelNames } from "@/mocked/models";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const modelNames = getPrismaModelNames();
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const professionalId = params.id;

    // First check if the professional exists
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // Filter out the 'professional' model from the modelNames
    const recordModelNames = modelNames.filter(name => name !== 'professional');

    const recordsPromises = recordModelNames.map(async (modelName) => {
      // @ts-ignore: acesso dinâmico ao Prisma
      const records = await prisma[modelName].findMany({
        where: { professionalId },
        include: { professional: true },
      });

      return records.map((record: any) => ({
        ...record,
        type: modelName,
      }));
    });

    const results = await Promise.all(recordsPromises);

    const allRecordsFlat = results.flat();

    const allRecordsGrouped = results.reduce(
      (acc: any, curr: any, i: number) => {
        acc[recordModelNames[i]] = curr;
        return acc;
      },
      {} as Record<string, any[]>
    );

    allRecordsGrouped.total = allRecordsFlat.length;
    allRecordsGrouped.records = allRecordsFlat;

    if (allRecordsFlat.length === 0) {
      return NextResponse.json(
        { error: "No records found for this professional" },
        { status: 404 }
      );
    }

    return NextResponse.json(allRecordsGrouped);
  } catch (error) {
    console.error("Error fetching professional records:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional records" },
      { status: 500 }
    );
  }
}
