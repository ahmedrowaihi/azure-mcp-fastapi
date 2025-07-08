import { formatTeamList, formatTeamMemberList } from "@formatters/team";
import { z } from "zod";

import type { TeamService } from "@azure/services/team";
import type { FastMCP } from "fastmcp";

export function registerTeamTools(server: FastMCP, teamService: TeamService) {
  server.addTool({
    name: "team-list",
    description: `
      List all teams for a specific project.
      Required parameters:
        - project: The Azure DevOps project name (e.g., "MyProject").
      Returns: Array of teams with their IDs, names, descriptions, and project information.
      Example: { "project": "MyProject" }

      ---
      Note: if you want to get the teams for an project, you can use the project.list tool.
    `,
    parameters: z.object({ project: z.string() }),
    async execute(args) {
      const { project } = args;
      const teams = await teamService.listTeams(project);
      return JSON.stringify(formatTeamList(teams));
    },
  });
  
  server.addTool({
    name: "team-list-members",
    description: `
      List all team members for a specific team.
      Required parameters:
        - project: The Azure DevOps project name (e.g., "MyProject").
        - team: The team name (e.g., "Development Team").
      Returns: Array of team members with their identity information and admin status.
      Example: { "project": "MyProject", "team": "Development Team" }

      ---
      Note: if you want to get the team members for a project, you can use the project.listTeams tool.
    `,
    parameters: z.object({ project: z.string(), team: z.string() }),
    async execute(args) {
      const { project, team } = args;
      const members = await teamService.listTeamMembers(project, team);
      return JSON.stringify(formatTeamMemberList(members));
    },
  });
}
