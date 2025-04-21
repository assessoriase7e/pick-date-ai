import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!apiKey) {
      return new NextResponse(
        "API Key not found or you don't have permission",
        { status: 404 }
      );
    }

    await prisma.apiKey.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[API_KEY_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
