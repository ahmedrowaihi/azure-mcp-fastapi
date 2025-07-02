import { formatTeamList, formatTeamMemberList } from '@formatters/team';
import { z } from 'zod';

import type { TeamService } from '@azure/services/team';
import type { FastMCP } from 'fastmcp';

export function registerTeamTools(server: FastMCP, teamService: TeamService) {
    server.addTool({
        name: 'listTeams',
        description: 'List teams for a project',
        parameters: z.object({ project: z.string() }),
        async execute(args) {
            const { project } = args;
            const teams = await teamService.listTeams(project);
            return JSON.stringify(formatTeamList(teams));
        },
    });
    server.addTool({
        name: 'listTeamMembers',
        description: 'List team members for a team',
        parameters: z.object({ project: z.string(), team: z.string() }),
        async execute(args) {
            const { project, team } = args;
            const members = await teamService.listTeamMembers(project, team);
            return JSON.stringify(formatTeamMemberList(members));
        },
    });
}
