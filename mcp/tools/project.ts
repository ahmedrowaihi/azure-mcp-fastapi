import { formatProjectList } from "@formatters/project";

import type { ProjectService } from "@azure/services/project";
import type { FastMCP } from "fastmcp";

export function registerProjectTools(
  server: FastMCP,
  projectService: ProjectService
) {
  server.addTool({
    name: "project-list",
    description: `
      List all Azure DevOps projects in your organization.
      No parameters required.
      Returns: Array of projects with their IDs, names, descriptions, and URLs.
    `,
    async execute() {
      const projects = await projectService.listProjects();
      return JSON.stringify(formatProjectList(projects));
    },
  });
}
