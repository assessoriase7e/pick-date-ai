import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.imageRecord.findUnique({
      where: { id: params.id },
      include: {
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { description, imageBase64, professionalId } = body;

    if (!description && !imageBase64 && !professionalId) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (description) updateData.description = description;
    if (imageBase64) updateData.imageBase64 = imageBase64;
    if (professionalId) updateData.professionalId = professionalId;

    const image = await prisma.imageRecord.update({
      where: { id: params.id },
      data: updateData,
      include: {
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.imageRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
