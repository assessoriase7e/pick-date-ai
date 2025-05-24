import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import moment from "moment";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance");
    const clientPhone = searchParams.get("client-phone");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 400 }
      );
    }

    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: { name: instance },
      include: { user: true },
    });

    if (!evolutionInstance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    let whereClause: Prisma.AppointmentWhereInput = {
      AND: [{ userId: evolutionInstance.userId }, { status: "scheduled" }],
    };

    if (clientPhone) {
      whereClause.client = {
        phone: clientPhone,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: {
          omit: {
            birthDate: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
        service: {
          omit: {
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
        calendar: {
          omit: {
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
        collaborator: {
          omit: {
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 204 }
      );
    }

    const body = await req.json();
    const { startTime, endTime, clientId, serviceId, calendarId, finalPrice } =
      body;

    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: { name: instance },
      include: { user: true },
    });

    if (!evolutionInstance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 204 }
      );
    }

    // Buscar o calendário para obter o collaboratorId
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendário não encontrado" },
        { status: 204 }
      );
    }

    // Verificar conflito de horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        calendarId: calendarId,
        status: "scheduled",
        OR: [
          {
            startTime: {
              lt: moment(endTime).toDate(),
            },
            endTime: {
              gt: moment(startTime).toDate(),
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Já existe um agendamento para este horário." },
        { status: 202 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return new Response(undefined, { status: 204 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        startTime,
        endTime,
        clientId,
        serviceId,
        calendarId,
        collaboratorId: calendar.collaboratorId,
        finalPrice: Number(finalPrice),
        userId: evolutionInstance.userId,
      },
      include: {
        client: true,
        service: true,
        calendar: true,
        collaborator: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance");
    const appointmentId = searchParams.get("id");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 400 }
      );
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: "ID do agendamento não fornecido" },
        { status: 400 }
      );
    }

    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: { name: instance },
      include: { user: true },
    });

    if (!evolutionInstance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const dataToUpdate: Prisma.AppointmentUpdateInput = {};

    if (body.startTime !== undefined)
      dataToUpdate.startTime = new Date(body.startTime);
    if (body.endTime !== undefined)
      dataToUpdate.endTime = new Date(body.endTime);
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.notes !== undefined) dataToUpdate.notes = body.notes;
    if (body.servicePrice !== undefined)
      dataToUpdate.servicePrice = body.servicePrice;
    if (body.finalPrice !== undefined)
      dataToUpdate.finalPrice = body.finalPrice;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar foi enviado" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: evolutionInstance.userId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: dataToUpdate,
      include: {
        client: true,
        service: true,
        calendar: true,
        collaborator: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance");
    const appointmentId = searchParams.get("id");

    if (!instance) {
      return NextResponse.json(
        { error: "Instância não fornecida" },
        { status: 400 }
      );
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: "ID do agendamento não fornecido" },
        { status: 400 }
      );
    }

    const evolutionInstance = await prisma.evolutionInstance.findFirst({
      where: { name: instance },
      include: { user: true },
    });

    if (!evolutionInstance) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: evolutionInstance.userId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir agendamento" },
      { status: 500 }
    );
  }
}
