import { formatProjectList } from "@formatters/project";

import type { ProjectService } from "@azure/services/project";
import type { FastMCP } from "fastmcp";

export function registerProjectTools(
  server: FastMCP,
  projectService: ProjectService
) {
  server.addTool({
    name: "listProjects",
    description: "List Azure DevOps projects",
    async execute() {
      const projects = await projectService.listProjects();
      return JSON.stringify(formatProjectList(projects));
    },
  });
}
