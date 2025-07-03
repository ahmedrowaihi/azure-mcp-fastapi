import type { WebApi } from "azure-devops-node-api";
import type { IProfileApi } from "azure-devops-node-api/ProfileApi";

export class ProfileService {
  private api?: IProfileApi;
  constructor(private readonly azure: WebApi) {
    if (!azure) throw new Error("Connection is required");
  }
  private async getApi() {
    if (!this.api) {
      this.api = await this.azure.getProfileApi();
    }
    return this.api;
  }
  async getUserProfile(id: string, details = true) {
    const api = await this.getApi();
    return api.getProfile(id, details);
  }
  async getCurrentUserProfile() {
    const api = await this.getApi();
    return api.getUserDefaults(false);
  }
}
