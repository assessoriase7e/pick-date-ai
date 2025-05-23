import { createClientTool } from "./createClient";
import { getBusinessProfileTool } from "./getBusiness";
import { getClientTool } from "./getClient";

export const agentTools = [
  createClientTool,
  getClientTool,
  getBusinessProfileTool,
];
