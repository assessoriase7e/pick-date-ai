import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface Params {
  params: { id: string };
}

// PATCH: Atualizar a descrição de uma chave de API
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    const { description } = await req.json();
    const { id } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
      return new NextResponse("API Key ID is required", { status: 400 });
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey || apiKey.userId !== userId) {
      return new NextResponse("API Key not found or access denied", {
        status: 404,
      });
    }

    const updatedApiKey = await prisma.apiKey.update({
      where: { id },
      data: { description },
    });

    // Não retorne a chave (updatedApiKey.key) aqui por segurança
    return NextResponse.json({
      id: updatedApiKey.id,
      description: updatedApiKey.description,
    });
  } catch (error) {
    console.error("[API_KEYS_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Deletar uma chave de API
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    const { id } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
      return new NextResponse("API Key ID is required", { status: 400 });
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    // Verifica se a chave existe e pertence ao usuário logado
    if (!apiKey || apiKey.userId !== userId) {
      return new NextResponse("API Key not found or access denied", {
        status: 404,
      });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("[API_KEYS_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
