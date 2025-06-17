"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { updateSessionSchema } from "@/validators/waha";
import { waha } from "@/utils/waha";
import { WahaInstance } from "@prisma/client";

const wahaApi = waha();

export async function updateSession(data: WahaInstance) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const validatedData = updateSessionSchema.parse(data);

  try {
    // Check if session exists and belongs to user
    const existingSession = await prisma.wahaInstance.findFirst({
      where: {
        id: Number(validatedData.id),
        userId,
      },
    });

    if (!existingSession) {
      throw new Error("Session not found or access denied");
    }

    // Get webhook URL from environment variable
    const webhookUrl = process.env.ATTENDANT_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("ATTENDANT_WEBHOOK_URL environment variable is not set");
    }

    // Generate new session name
    const cleanNumber = validatedData.number.replace(/\D/g, "");
    const company = validatedData.name || "default";
    const sessionName = `${cleanNumber}_${company}`;

    // Update session in WAHA with webhook URL
    const response = await wahaApi.updateSession(sessionName, webhookUrl);

    // Update session in database using response data
    const updatedSession = await prisma.wahaInstance.update({
      where: {
        id: Number(validatedData.id),
      },
      data: {
        name: response.data.name || sessionName,
        number: validatedData.number,
        status: response.data.status || existingSession.status,
      },
    });

    revalidatePath("/agents/waha");
    return { success: true, data: updatedSession };
  } catch (error) {
    console.error("Error updating WAHA session:", error);
    throw new Error("Failed to update WAHA session");
  }
}
