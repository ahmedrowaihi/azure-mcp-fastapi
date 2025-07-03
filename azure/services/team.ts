import type { WebApi } from "azure-devops-node-api";
import type { ICoreApi } from "azure-devops-node-api/CoreApi";

export class TeamService {
  private api?: ICoreApi;
  constructor(private readonly azure: WebApi) {
    if (!azure) throw new Error("Connection is required");
  }
  private async getApi() {
    if (!this.api) {
      this.api = await this.azure.getCoreApi();
    }
    return this.api;
  }
  async listTeams(project: string) {
    const api = await this.getApi();
    return api.getTeams(project);
  }
  async listTeamMembers(project: string, team: string) {
    const api = await this.getApi();
    return api.getTeamMembersWithExtendedProperties(project, team);
  }
}
