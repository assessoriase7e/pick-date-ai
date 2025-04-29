import { type NextRequest, NextResponse } from "next/server";
import { getClient } from "@/actions/clients/get-client";
import { saveClient } from "@/actions/clients/save-client";
import { deleteClient } from "@/actions/clients/delete-client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getClient(params.id);
  if (result.success && result.data) {
    return NextResponse.json(result.data.client);
  }
  return NextResponse.json({ error: result.error }, { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    data.id = params.id;
    const result = await saveClient(data);
    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await deleteClient(params.id);
  if (result.success) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: result.error }, { status: 400 });
}
