import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

// Mapeia os tipos MIME para extensões conhecidas
const mimeToExtension: Record<string, string> = {
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/webm": "webm",
    "audio/mp4": "m4a",
    "audio/x-wav": "wav",
    "audio/x-m4a": "m4a",

    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",

    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
};

export const base64ToFile = async (
    base64String: string,
    filename: string,
    mimeType: string
) => {
    const extension = mimeToExtension[mimeType] || null;

    // Adiciona a extensão correta, se não estiver presente
    let finalFilename = filename;
    if (extension && !filename.endsWith(`.${extension}`)) {
        finalFilename = `${filename}.${extension}`;
    }

    const base64Data = base64String.split(",").pop() || "";
    const buffer = Buffer.from(base64Data, "base64");
    const tempDir = path.join(process.cwd(), "temp");

    await fs.promises.mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, finalFilename);
    await writeFile(filePath, buffer);

    const fileStream = fs.createReadStream(filePath);

    return {
        path: `/temp/${finalFilename}`,
        fileStream,
        mimeType,
        extension,
    };
};
