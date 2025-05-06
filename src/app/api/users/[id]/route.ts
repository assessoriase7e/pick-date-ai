import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const paramsResolved = await params;

  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: paramsResolved.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const paramsResolved = await params;

  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      companyName,
      address,
      locationUrl,
      documentNumber,
      businessHours,
    } = body;

    if (
      !firstName &&
      !lastName &&
      !phone &&
      !companyName &&
      !address &&
      !locationUrl &&
      !documentNumber &&
      !businessHours
    ) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      );
    }

    const userData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    };

    const profileData = {
      ...(phone && { phone }),
      ...(companyName && { companyName }),
      ...(address && { address }),
      ...(locationUrl && { locationUrl }),
      ...(documentNumber && { documentNumber }),
      ...(businessHours && { businessHours }),
    };

    const user = await prisma.user.update({
      where: { id: paramsResolved.id },
      data: {
        ...userData,
        profile:
          Object.keys(profileData).length > 0
            ? {
                upsert: {
                  create: profileData,
                  update: profileData,
                },
              }
            : undefined,
      },
      include: { profile: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
