"use server";

import { prisma } from "@/lib/db";

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return services;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    throw new Error("Não foi possível carregar os serviços");
  }
}

export async function getServiceById(id: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    return service;
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    throw new Error("Não foi possível carregar o serviço");
  }
}
