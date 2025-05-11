import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
  fileUploader: f({
    audio: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
    text: {
      maxFileSize: "1MB",
      maxFileCount: 1,
    },
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      const user = auth(req);

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
