"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createSessionSchema } from "@/validators/waha";
import { waha } from "@/utils/waha";

const wahaApi = waha();

// Change this line - remove WahaInstance import and use unknown instead
export async function createSession(data: unknown) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const validatedData = createSessionSchema.parse(data);

  try {
    // Get webhook URL from environment variable
    const webhookUrl = process.env.ATTENDANT_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("ATTENDANT_WEBHOOK_URL environment variable is not set");
    }

    // Create session in WAHA with webhook URL
    const response = await wahaApi.createSession(validatedData.name, webhookUrl);

    // Save session to database using response data
    const wahaInstance = await prisma.wahaInstance.create({
      data: {
        name: response.data.name || validatedData.name,
        number: validatedData.number,
        userId,
        status: response.data.status || "STARTING",
      },
    });

    revalidatePath("/agents/waha");
    return { success: true, data: wahaInstance };
  } catch (error) {
    console.error("Error creating WAHA session:", error);
    throw new Error("Failed to create WAHA session");
  }
}
