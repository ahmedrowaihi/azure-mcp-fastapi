import type { WebApi } from "azure-devops-node-api";
import type { ICoreApi } from "azure-devops-node-api/CoreApi";

export class ProjectService {
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

  async listProjects() {
    const api = await this.getApi();
    return api.getProjects();
  }
}
