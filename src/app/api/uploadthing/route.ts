// src/app/api/uploadthing/route.ts

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/app/api/uploadthing/core"; // CORRETO

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

export const runtime = "nodejs";
