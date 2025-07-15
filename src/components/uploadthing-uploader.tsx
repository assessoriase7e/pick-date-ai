"use client";
import { generateUploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";
import "@uploadthing/react/styles.css";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

interface UploadthingUploaderProps {
  onUploadBegin?: () => void;
  onUploadComplete: (data: { fileUrl: string; fileName: string; fileType: string }) => void;
  onUploadError?: (error: Error) => void;
  endpoint?: keyof OurFileRouter;
  className?: string;
}

export function UploadthingUploader({
  onUploadBegin,
  onUploadComplete,
  onUploadError,
  endpoint = "fileUploader",
  className,
}: UploadthingUploaderProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      config={{ mode: "auto" }}
      onUploadBegin={onUploadBegin}
      onClientUploadComplete={(res) => {
        if (res && res.length > 0) {
          const file = res[0];

          // Limpar a URL removendo espaços e caracteres de backtick
          const cleanUrl = file.ufsUrl.trim().replace(/`/g, "");

          onUploadComplete({
            fileUrl: cleanUrl,
            fileName: file.name,
            fileType: file.name.split(".").pop() || "",
          });
          toast("Arquivo enviado com sucesso!");
        }
      }}
      onUploadError={(error: Error) => {
        toast(`Erro: ${error.message}`);
        console.error(error);
        if (onUploadError) {
          onUploadError(error);
        }
      }}
      content={{
        button: <span className="w-full">Selecionar</span>,
        label: "Arraste e solte o arquivo aqui ou clique para selecionar",
        allowedContent: "Audio, imagem, texto ou PDF",
      }}
      className={`ut-button:bg-primary ut-label:text-muted-foreground ${className || ""}`}
    />
  );
}
