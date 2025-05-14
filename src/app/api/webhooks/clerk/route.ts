import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Clerk webhook secret not found in environment variables.");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses?.find(
      (email) => email.id === evt.data.primary_email_address_id
    )?.email_address;

    if (!primaryEmail) {
      return new Response("Primary email not found", { status: 400 });
    }

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ id }, { email: primaryEmail }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: true, message: "User already exists", user: existingUser },
          { status: 200 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          id,
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url || "",
        },
      });

      return NextResponse.json(
        { success: true, user: newUser },
        { status: 201 }
      );
    } catch (error) {
      if (
        (error as any).code === "P2002" &&
        (error as any).meta?.target?.includes("email")
      ) {
        return NextResponse.json(
          { success: true, message: "User already exists" },
          { status: 200 }
        );
      }
      if (
        (error as any).code === "P2002" &&
        (error as any).meta?.target?.includes("id")
      ) {
        return NextResponse.json(
          { success: true, message: "User already exists" },
          { status: 200 }
        );
      }
      return new Response("Error occured while creating user in DB", {
        status: 500,
      });
    }
  }

  return new Response("", { status: 200 });
}
