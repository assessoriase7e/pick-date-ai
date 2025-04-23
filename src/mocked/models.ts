import { prisma } from "@/lib/db";

export function getPrismaModelNames(): string[] {
  return Object.keys(prisma).filter((key) => {
    const model = (prisma as any)[key];
    return (
      typeof model === "object" &&
      model !== null &&
      typeof model.findMany === "function"
    );
  });
}
