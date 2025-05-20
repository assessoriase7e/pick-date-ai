import { EvolutionData } from "@/types/evolutionData";
import { deleteFile } from "./deleteFile";
import { base64ToFile } from "./base64ToFile";
import { openai } from "@/lib/openai";

type MsgSegregationProps = {
    evoData: EvolutionData;
};

export const setMessage = async ({ evoData }: MsgSegregationProps) => {
    let messageType = "";

    if (
        evoData.data.message.conversation &&
        evoData.data.contextInfo?.quotedMessage
    ) {
        messageType = "quoted";
    } else {
        messageType = evoData.data.messageType;
    }

    switch (messageType) {
        case "conversation":
            return evoData.data.message.conversation!;

        case "imageMessage":
            break;
        case "quoted":
            return `Mensagem marcada: ${evoData.data.contextInfo?.quotedMessage.conversation}\nMensagem do usuário: ${evoData.data.message.conversation}`;

        case "audioMessage":
            const { fileStream, path: audioPath } = await base64ToFile(
                evoData.data.message.base64!,
                String(evoData.data.messageTimestamp),
                evoData.data.message.audioMessage?.mimetype!
            );

            const transcription = await openai.audio.transcriptions.create({
                file: fileStream,
                model: "whisper-1",
            });

            deleteFile(audioPath);

            return transcription.text;
        default:
            break;
    }
};
