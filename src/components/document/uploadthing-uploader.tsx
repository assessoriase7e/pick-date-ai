"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";
import "@uploadthing/react/styles.css";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

interface UploadthingUploaderProps {
  onUploadComplete: (data: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) => void;
  onUploadError?: (error: Error) => void;
}

export function UploadthingUploader({
  onUploadComplete,
  onUploadError,
}: UploadthingUploaderProps) {
  return (
    <UploadDropzone
      endpoint="fileUploader"
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
      className="ut-button:bg-primary ut-label:text-muted-foreground"
    />
  );
}
