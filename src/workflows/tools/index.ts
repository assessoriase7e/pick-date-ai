import { createClientTool } from "./createClient";
import { getBusinessProfileTool } from "./getBusiness";
import { getClientTool } from "./getClient";
import { getCollabsTool } from "./getCollabs";
import { getServicesTool } from "./getServices";

export const agentTools = [
  createClientTool,
  getClientTool,
  getBusinessProfileTool,
  getServicesTool,
  getCollabsTool,
];
