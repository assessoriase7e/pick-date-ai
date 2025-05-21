"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { isCollaboratorAvailable } from "@/utils/checkCollaboratorAvailability";

// Adicione esta interface para os dados do cliente público
interface PublicClientData {
    fullName: string;
    email: string;
    phone: string;
}

export async function createAppointment({
    clientId,
    serviceId,
    calendarId,
    startTime,
    endTime,
    notes,
    status,
    servicePrice,
    finalPrice,
    collaboratorId,
    publicClientData,
}: {
    clientId: string;
    serviceId: string;
    calendarId: string;
    startTime: Date;
    endTime: Date;
    notes: string | null;
    status: string;
    servicePrice: number | null;
    finalPrice: number | null;
    collaboratorId: string | null;
    publicClientData?: PublicClientData;
}) {
    try {
        // Get the authenticated user ID or use the calendar's user ID for public appointments
        let userId: string | null = null;

        // For public appointments, get the userId from the calendar
        if (publicClientData) {
            const calendar = await prisma.calendar.findUnique({
                where: { id: calendarId },
                select: { userId: true },
            });

            if (!calendar) {
                return {
                    success: false,
                    error: "Calendário não encontrado",
                };
            }

            userId = calendar.userId;
        } else {
            // For authenticated appointments, get the userId from auth
            const authResult = await auth();
            userId = authResult.userId;

            if (!userId) {
                return {
                    success: false,
                    error: "Usuário não autenticado",
                };
            }
        }

        // Se temos dados de cliente público, criar um cliente temporário
        let actualClientId = clientId;

        if (publicClientData) {
            // Verificar se já existe um cliente com este email
            const existingClient = await prisma.client.findFirst({
                where: {
                    phone: publicClientData.phone,
                },
            });

            if (existingClient) {
                actualClientId = existingClient.id;
            } else {
                // Criar um novo cliente
                const newClient = await prisma.client.create({
                    data: {
                        fullName: publicClientData.fullName,
                        phone: publicClientData.phone,
                        userId: userId,
                    },
                });

                actualClientId = newClient.id;
            }
        }

        // Verificar disponibilidade do colaborador
        if (collaboratorId) {
            const collaborator = await prisma.collaborator.findUnique({
                where: { id: collaboratorId }
            });
            
            if (collaborator && !isCollaboratorAvailable(collaborator, startTime, endTime)) {
                return {
                    success: false,
                    error: "Horário do profissional indisponível",
                };
            }
        }

        // Verificar conflitos de horário
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                OR: [
                    {
                        startTime: {
                            lte: startTime,
                        },
                        endTime: {
                            gt: startTime,
                        },
                    },
                    {
                        startTime: {
                            lt: endTime,
                        },
                        endTime: {
                            gte: endTime,
                        },
                    },
                    {
                        startTime: {
                            gte: startTime,
                        },
                        endTime: {
                            lte: endTime,
                        },
                    },
                ],
                status: "scheduled",
                calendarId: calendarId,
            },
        });

        if (conflictingAppointment) {
            return {
                success: false,
                error: "Já existe um agendamento neste horário",
            };
        }

        // Se não houver preço definido, busca o preço do serviço
        let finalServicePrice = servicePrice;
        let finalFinalPrice = finalPrice;

        if (!finalServicePrice || !finalFinalPrice) {
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
            });

            if (service) {
                finalServicePrice = finalServicePrice || service.price;
                finalFinalPrice = finalFinalPrice || service.price;
            }
        }

        // Criar o agendamento
        const appointment = await prisma.appointment.create({
            data: {
                clientId: actualClientId,
                serviceId,
                calendarId,
                startTime,
                endTime,
                notes,
                status,
                servicePrice: finalServicePrice,
                finalPrice: finalFinalPrice,
                collaboratorId,
                userId: userId, // Adicionar o userId aqui
            },
            include: {
                client: true,
                service: true,
            },
        });

        revalidatePath("/calendar");
        revalidatePath("/reports");
        revalidatePath("/appointments");

        return {
            success: true,
            data: appointment,
        };
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return {
            success: false,
            error: "Falha ao criar agendamento",
        };
    }
}
