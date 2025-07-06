import { registerProjectTools } from "@mcp/tools/project";
import { registerTeamTools } from "@mcp/tools/team";
import { registerWikiTools } from "@mcp/tools/wiki";
import { registerWorkItemTools } from "@mcp/tools/workItem";
import { FastMCP } from "fastmcp";

import type { provisionServices } from "../azure/services";
import { registerResource } from "./resources/register-resource";

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

  registerResource(server);

  // Register tools for each service
  registerProjectTools(server, services.projectService);
  registerWorkItemTools(server, services.workItemService);
  registerTeamTools(server, services.teamService);
  registerWikiTools(server, services.wikiService);

  // You can add more global tools here if needed

  return server;
}
