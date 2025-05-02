"use server";

import { revalidateTag } from "next/cache";

export async function revalidateReports(tags: string[] = ["dashboard"]) {
  // Revalidar tags específicas
  tags.forEach(tag => revalidateTag(tag));
  
  return { revalidated: true, timestamp: Date.now() };
}