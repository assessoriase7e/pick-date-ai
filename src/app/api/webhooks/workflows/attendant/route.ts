import { prisma } from "@/lib/db";
import { EvolutionData } from "@/types/evolutionData";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = (await req.json()) as EvolutionData;
    const number = body.data.key.remoteJid.split("@")[0];

    const isBLocked = await prisma.blackListPhone.findFirst({
        where: { number },
    });

    if (!!isBLocked) {
        return NextResponse.json({ success: false }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
