import { registerProjectTools } from "@mcp/tools/project";
import { registerTeamTools } from "@mcp/tools/team";
import { registerWorkItemTools } from "@mcp/tools/workItem";
import { FastMCP } from "fastmcp";

import type { provisionServices } from "../azure/services";

export function createServer({
  services,
}: {
  services: ReturnType<typeof provisionServices>;
}): FastMCP {
  const server = new FastMCP({
    name: "Azure MCP Server",
    version: "1.0.0",
    instructions: "This is a MCP server for Azure DevOps",
  });

  // Register tools for each service
  registerProjectTools(server, services.projectService);
  registerWorkItemTools(server, services.workItemService);
  registerTeamTools(server, services.teamService);

  // You can add more global tools here if needed

  return server;
}
