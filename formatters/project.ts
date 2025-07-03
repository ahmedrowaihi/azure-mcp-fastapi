import type { TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";

export function formatProjectList(
  projects: TeamProjectReference[] | null
): Partial<TeamProjectReference>[] {
  if (!projects) return [];
  return projects;
}
