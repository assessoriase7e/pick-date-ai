"use server";

import { prisma } from "@/lib/db";

export async function getAllProfessionals() {
  try {
    const professionals = await prisma.user.findMany({
      orderBy: {
        firstName: "asc",
      },
    });

    return { success: true, data: professionals };
  } catch (error) {
    console.error("Error fetching professionals:", error);
    throw new Error("Failed to fetch professionals");
  }
}
