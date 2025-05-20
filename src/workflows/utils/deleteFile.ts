import fs from "fs";
import path from "path";

export const deleteFile = async (filePath: string) => {
    const tempFilePath = path.join(process.cwd(), filePath.replace(/^\//, ""));

    try {
        await fs.promises.unlink(tempFilePath);
        console.log(`Arquivo excluído: ${tempFilePath}`);
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.warn(
                `Arquivo não encontrado para exclusão: ${tempFilePath}`
            );
        } else {
            console.error(`Erro ao excluir arquivo: ${error.message}`);
            throw error;
        }
    }
};
