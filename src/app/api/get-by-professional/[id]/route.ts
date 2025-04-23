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
    
    // Get fields from query parameters
    const url = new URL(req.url);
    const fieldsParam = url.searchParams.get('fields');
    const fields = fieldsParam ? fieldsParam.split(',') : null;

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

            for (const key in standardizedRecord) {
              if (
                key.endsWith("Base64") ||
                key.toLowerCase().includes("base64")
              ) {
                standardizedRecord.base64 = standardizedRecord[key];
                delete standardizedRecord[key];
              }
            }
            
            // Filter fields if specified in query
            if (fields) {
              const filteredRecord: any = {};
              
              // Always include id and type
              filteredRecord.id = standardizedRecord.id;
              filteredRecord.type = modelName;
              
              // Add requested fields
              fields.forEach(field => {
                if (field in standardizedRecord) {
                  filteredRecord[field] = standardizedRecord[field];
                }
              });
              
              // Always include base64 if it was requested or if no fields were specified
              if (fields.includes('base64') && standardizedRecord.base64) {
                filteredRecord.base64 = standardizedRecord.base64;
              }
              
              unifiedRecords.push(filteredRecord);
            } else {
              // No fields specified, include all
              unifiedRecords.push({
                ...standardizedRecord,
                type: modelName,
              });
            }
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
