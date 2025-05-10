import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key-utils";
import moment from "moment";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessPhone = searchParams.get("business-phone");

    if (!businessPhone) {
      return NextResponse.json(
        { error: "O parâmetro 'business-phone' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      startTime,
      endTime,
      clientId,
      serviceId,
      calendarId,
      collaboratorId,
      finalPrice,
    } = body;

    const userProfile = await prisma.profile.findFirst({
      where: { whatsapp: businessPhone },
      include: { user: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        {
          error: "Usuário não encontrado com este número de telefone comercial",
        },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        startTime: moment(startTime).toDate(),
        endTime: moment(endTime).toDate(),
        clientId,
        serviceId,
        calendarId,
        collaboratorId,
        finalPrice: Number(finalPrice),
        userId: userProfile.user.id,
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
    const appointmentId = searchParams.get("id");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "O parâmetro 'id' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Monta dinamicamente apenas os campos presentes no body
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
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 204 }
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
    const appointmentId = searchParams.get("id");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "O parâmetro 'id' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 204 }
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

export async function GET(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("Authorization");
    const validationResult = await validateApiKey(apiKeyHeader);

    if (!validationResult.isValid) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessPhone = searchParams.get("business-phone");
    const clientPhone = searchParams.get("client-phone");

    if (!businessPhone) {
      return NextResponse.json(
        { error: "O parâmetro 'business-phone' é obrigatório na URL" },
        { status: 400 }
      );
    }

    if (!clientPhone) {
      return NextResponse.json(
        { error: "O parâmetro 'client-phone' é obrigatório na URL" },
        { status: 400 }
      );
    }

    const userProfile = await prisma.profile.findFirst({
      where: { whatsapp: businessPhone },
      include: { user: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        {
          error: "Usuário não encontrado com este número de telefone comercial",
        },
        { status: 404 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        phone: clientPhone,
        userId: userProfile.user.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 204 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: client.id,
        userId: userProfile.user.id,
      },
      include: {
        client: true,
        service: true,
        calendar: true,
        collaborator: true,
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
