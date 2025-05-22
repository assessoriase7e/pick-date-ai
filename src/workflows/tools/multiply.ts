import { tool } from "@langchain/core/tools";
import { z } from "zod";

const multiplyFn = ({ a, b }: { a: number; b: number }): number => {
  return a * b;
};

// @ts-ignore
export const multiply = tool(multiplyFn, {
  name: "multiply",
  description: "Use essa tool para multiplicar dois números",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
});
