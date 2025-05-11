import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    pdf: { maxFileSize: "64MB" },
    image: { maxFileSize: "1MB" },
    audio: { maxFileSize: "4MB" },
  })
    .middleware(async () => {
      const user = await currentUser();

      if (!user) throw new Error("Não autorizado");

      return { userId: user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileType: file.name.split(".").pop() || "",
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
