import type { TeamMember } from "azure-devops-node-api/interfaces/common/VSSInterfaces";
import type { WebApiTeam } from "azure-devops-node-api/interfaces/CoreInterfaces";

export function formatTeamList(
  teams: WebApiTeam[] | null
): Partial<WebApiTeam>[] {
  if (!teams) return [];
  return teams.map((t) => ({
    id: t.id,
    identity: t.identity,
    name: t.name,
    description: t.description,

    projectId: t.projectId,
    projectName: t.projectName,
  }));
}

export function formatTeamMemberList(
  members: TeamMember[] | null
): Partial<TeamMember>[] {
  if (!members) return [];
  return members.map((m) => ({
    identity: {
      id: m.identity?.id,
      displayName: m.identity?.displayName,
      uniqueName: m.identity?.uniqueName,
      descriptor: m.identity?.descriptor,
      inactive: m.identity?.inactive,
    },
    isTeamAdmin: m.isTeamAdmin,
  }));
}
