import { EvolutionData } from "@/types/evolutionData";
import { checkBlocked } from "@/workflows/utils/checkBlocked";
import { messageBuffer } from "@/workflows/utils/messageBuffer";
import { setMessage } from "@/workflows/utils/setMessage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as EvolutionData;
  const number = body.data.key.remoteJid.split("@")[0];

  //Check blcked
  const isBLocked = await checkBlocked(body.instance, number);

  if (!!isBLocked) {
    return NextResponse.json({ success: false }, { status: 200 });
  }

  const message = await setMessage({ evoData: body });

  if (!message) {
    return NextResponse.json({ success: false }, { status: 200 });
  }

  await messageBuffer({
    remoteId: body.instance,
    newMessage: message,
    delayInSeconds: 7,
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
