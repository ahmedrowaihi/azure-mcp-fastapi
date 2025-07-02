import type { WebApi } from 'azure-devops-node-api';
import type { IPolicyApi } from 'azure-devops-node-api/PolicyApi';

export class PolicyService {
    private api?: IPolicyApi;
    constructor(private readonly azure: WebApi) {
        if (!azure) throw new Error('Connection is required');
    }
    private async getApi() {
        if (!this.api) {
            this.api = await this.azure.getPolicyApi();
        }
        return this.api;
    }
    async listPolicies(project: string, repoId?: string) {
        const api = await this.getApi();
        return api.getPolicyConfigurations(project, repoId);
    }
    async getPolicyDetails(project: string, configurationId: number) {
        const api = await this.getApi();
        return api.getPolicyConfiguration(project, configurationId);
    }
}
