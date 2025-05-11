"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";
import "@uploadthing/react/styles.css";
import { Button } from "./ui/button";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

interface UploadthingUploaderProps {
  onUploadComplete: (data: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) => void;
  onUploadError?: (error: Error) => void;
  endpoint?: keyof OurFileRouter;
  className?: string;
}

export function UploadthingUploader({
  onUploadComplete,
  onUploadError,
  endpoint = "fileUploader",
  className,
}: UploadthingUploaderProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      config={{ mode: "auto" }}
      onClientUploadComplete={(res) => {
        if (res && res.length > 0) {
          const file = res[0];
          onUploadComplete({
            fileUrl: file.ufsUrl,
            fileName: file.name,
            fileType: file.name.split(".").pop() || "",
          });
          toast("Arquivo enviado com sucesso!");
        }
      }}
      onUploadError={(error: Error) => {
        toast(`Erro: ${error.message}`);
        if (onUploadError) {
          onUploadError(error);
        }
      }}
      content={{
        button: <Button className="w-full">Selecionar</Button>,
        label: "Arraste e solte o arquivo aqui ou clique para selecionar",
        allowedContent: "Audio, imagem, texto ou PDF",
      }}
      className={`ut-button:bg-primary ut-label:text-muted-foreground ${
        className || ""
      }`}
    />
  );
}
