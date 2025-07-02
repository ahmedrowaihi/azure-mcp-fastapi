import type { WebApi } from 'azure-devops-node-api';
import type { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

export class WorkItemService {
    private api?: IWorkItemTrackingApi;
    constructor(private readonly azure: WebApi) {
        if (!azure) throw new Error('Connection is required');
    }
    private async getApi() {
        if (!this.api) {
            this.api = await this.azure.getWorkItemTrackingApi();
        }
        return this.api;
    }
    async listWorkItems(ids: number[]) {
        const api = await this.getApi();
        return api.getWorkItems(ids);
    }
    async getWorkItemDetails(id: number) {
        const api = await this.getApi();
        return api.getWorkItem(id);
    }
    async createWorkItem(project: string, type: string, fields: Record<string, any>) {
        const api = await this.getApi();
        // fields: { 'System.Title': '...', ... }
        const patch = Object.entries(fields).map(([key, value]) => ({
            op: 'add',
            path: `/fields/${key}`,
            value,
        }));
        return api.createWorkItem([], patch, project, type);
    }
    async updateWorkItem(id: number, fields: Record<string, any>) {
        const api = await this.getApi();
        const patch = Object.entries(fields).map(([key, value]) => ({
            op: 'add',
            path: `/fields/${key}`,
            value,
        }));
        return api.updateWorkItem([], patch, id);
    }
    async listWorkItemTypes(project: string) {
        const api = await this.getApi();
        return api.getWorkItemTypes(project);
    }
    async listWorkItemQueries(project: string) {
        const api = await this.getApi();
        return api.getQueries(project);
    }
}
