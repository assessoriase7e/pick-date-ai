import { type NextRequest, NextResponse } from "next/server";
import { getClients } from "@/actions/clients/get-clients";
import { saveClient } from "@/actions/clients/save-client";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await getClients();
  if (result.success && result.data) {
    return NextResponse.json(result.data.clients);
  }
  return NextResponse.json({ error: result.error }, { status: 500 });
}

export async function POST(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();
    let userId: string | undefined = undefined;
    if (validationResult.isMaster) {
      userId = data.userId || undefined;
    } else {
      userId = validationResult.userId;
    }
    const result = await saveClient({ ...data, userId });
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 201 });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
