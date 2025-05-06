import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let userId: string | undefined = undefined;
  if (validationResult.isMaster) {
    const body = await req.json();
    userId = body.userId || undefined;
    req.json = async () => body;
  } else {
    userId = validationResult.userId;
  }

  try {
    const body = await req.json();
    const {
      clientId,
      serviceId,
      calendarId,
      startTime,
      endTime,
      notes,
      status,
    } = body;

    if (
      !userId ||
      !clientId ||
      !serviceId ||
      !calendarId ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const calendar = await prisma.calendar.findFirst({
      where: { id: calendarId, userId: userId },
    });
    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found or access denied" },
        { status: 404 }
      );
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        calendarId,
        status: "scheduled",
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) },
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) },
          },
          {
            startTime: { gte: new Date(startTime) },
            endTime: { lte: new Date(endTime) },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Appointment conflict" },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        calendarId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        status: status || "scheduled",
        userId: userId,
      },
      include: {
        client: true,
        service: true,
        calendar: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let userId: string | undefined = undefined;
  if (validationResult.isMaster) {
    userId = searchParams.get("userId") || undefined;
  } else {
    userId = validationResult.userId;
  }

  try {
    const where = userId ? { userId } : {};
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        service: true,
        calendar: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
