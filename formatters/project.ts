import type { TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";

export function formatProjectList(
  projects: TeamProjectReference[]
): Partial<TeamProjectReference>[] {
  return projects;
}
