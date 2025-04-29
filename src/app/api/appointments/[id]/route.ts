import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid || !validationResult.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = validationResult.userId;

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
      include: {
        client: true,
        service: true,
        calendar: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKeyHeader = req.headers.get("Authorization");
  const validationResult = await validateApiKey(apiKeyHeader);
  if (!validationResult.isValid || !validationResult.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = validationResult.userId;

  try {
    const body = await req.json();

    // Verificar se o agendamento existe e pertence ao usuário
    const existingAppointment = await prisma.appointment.findFirst({
      where: { id: params.id, userId: userId },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found or access denied" },
        { status: 404 }
      );
    }

    // Validação (idealmente com Zod)
    const {
      clientId,
      serviceId,
      calendarId,
      startTime,
      endTime,
      notes,
      status,
    } = body;

    // Verificar conflito de horário se startTime ou endTime forem alterados
    if (startTime || endTime) {
      const checkStartTime = startTime
        ? new Date(startTime)
        : existingAppointment.startTime;
      const checkEndTime = endTime
        ? new Date(endTime)
        : existingAppointment.endTime;
      const checkCalendarId = calendarId || existingAppointment.calendarId;

      // Verificar se o novo calendário pertence ao usuário (se for alterado)
      if (calendarId && calendarId !== existingAppointment.calendarId) {
        const calendar = await prisma.calendar.findFirst({
          where: { id: calendarId, userId: userId },
        });
        if (!calendar) {
          return NextResponse.json(
            { error: "New calendar not found or access denied" },
            { status: 404 }
          );
        }
      }

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          calendarId: checkCalendarId,
          id: { not: params.id }, // Excluir o próprio agendamento da verificação
          status: "scheduled",
          OR: [
            {
              startTime: { lte: checkStartTime },
              endTime: { gt: checkStartTime },
            },
            { startTime: { lt: checkEndTime }, endTime: { gte: checkEndTime } },
            {
              startTime: { gte: checkStartTime },
              endTime: { lte: checkEndTime },
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
    }

    const updateData: any = {};
    if (clientId) updateData.clientId = clientId;
    if (serviceId) updateData.serviceId = serviceId;
    if (calendarId) updateData.calendarId = calendarId;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (notes !== undefined) updateData.notes = notes; // Permitir definir como null ou string vazia
    if (status) updateData.status = status; // Permitir atualização de status

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update provided" },
        { status: 400 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        service: true,
        calendar: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update appointment" },
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
  if (!validationResult.isValid || !validationResult.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = validationResult.userId;

  try {
    // Verificar se o agendamento existe e pertence ao usuário antes de deletar
    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, userId: userId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    // Prisma error code for record not found during delete
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
