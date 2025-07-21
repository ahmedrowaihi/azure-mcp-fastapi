import type { WebApi } from "azure-devops-node-api";
import type { IWorkApi } from "azure-devops-node-api/WorkApi";
import type { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import type { TeamContext } from "azure-devops-node-api/interfaces/CoreInterfaces";
import type { Wiql } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { TreeStructureGroup } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

function splitIntoChunks<T>(arr: T[], chunkSize: number = 100): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

export class WorkItemService {
  private api?: IWorkItemTrackingApi;
  private workApi?: IWorkApi;

  constructor(private readonly azure: WebApi) {
    if (!azure) throw new Error("Connection is required");
  }

  private async getApi() {
    if (!this.api) {
      this.api = await this.azure.getWorkItemTrackingApi();
    }
    return this.api;
  }

  private async getWorkApi() {
    if (!this.workApi) {
      this.workApi = await this.azure.getWorkApi();
    }
    return this.workApi;
  }

  async listWorkItems(ids: number[]) {
    const api = await this.getApi();
    return api.getWorkItems(ids);
  }

  async getWorkItemDetails(id: number) {
    const api = await this.getApi();
    return api.getWorkItem(id);
  }

  async createWorkItem(
    project: string,
    type: string,
    fields: Record<string, any>
  ) {
    const api = await this.getApi();
    const patch = Object.entries(fields).map(([key, value]) => ({
      op: "add",
      path: `/fields/${key}`,
      value,
    }));
    return api.createWorkItem([], patch, project, type);
  }

  async updateWorkItem(id: number, fields: Record<string, any>) {
    const api = await this.getApi();
    const patch = Object.entries(fields).map(([key, value]) => ({
      op: "add",
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

  async queryWorkItems(project: string, wiql: string, top?: number) {
    const api = await this.getApi();
    const query: Wiql = { query: wiql };
    const teamContext: TeamContext = { project: project };
    return api.queryByWiql(query, teamContext, false, top);
  }

  async executeQuery(project: string, queryId: string, top?: number) {
    const api = await this.getApi();
    const teamContext: TeamContext = { project: project };
    return api.queryById(queryId, teamContext, false, top);
  }

  async getWorkItemHistory(id: number, top?: number) {
    const api = await this.getApi();
    return api.getRevisions(id, top);
  }

  async linkWorkItems(sourceId: number, targetId: number, linkType: string) {
    const api = await this.getApi();
    const patch = [
      {
        op: "add",
        path: "/relations/-",
        value: {
          rel: linkType,
          url: `_apis/wit/workItems/${targetId}`,
        },
      },
    ];
    return api.updateWorkItem([], patch, sourceId);
  }

  async createEpic(
    project: string,
    title: string,
    description?: string,
    areaPath?: string
  ) {
    const fields: Record<string, any> = {
      "System.Title": title,
      "System.Description": description || "",
    };
    if (areaPath) {
      fields["System.AreaPath"] = areaPath;
    }
    return this.createWorkItem(project, "Epic", fields);
  }

  async createFeature(
    project: string,
    title: string,
    parentUrl: string,
    description?: string
  ) {
    const fields: Record<string, any> = {
      "System.Title": title,
      "System.Description": description || "",
    };
    const feature = await this.createWorkItem(project, "Feature", fields);

    // Link to Epic (parentUrl)
    await this.linkWorkItemsByUrl(
      parentUrl,
      feature.id!,
      "System.LinkTypes.Hierarchy-Reverse"
    );
    return feature;
  }

  async createUserStory(
    project: string,
    title: string,
    parentUrl: string,
    description?: string,
    storyPoints?: number
  ) {
    const fields: Record<string, any> = {
      "System.Title": title,
      "System.Description": description || "",
    };
    if (storyPoints) {
      fields["Microsoft.VSTS.Scheduling.StoryPoints"] = storyPoints;
    }
    const story = await this.createWorkItem(project, "User Story", fields);

    // Link to Feature (parentUrl)
    await this.linkWorkItemsByUrl(
      parentUrl,
      story.id!,
      "System.LinkTypes.Hierarchy-Reverse"
    );
    return story;
  }

  async createTask(
    project: string,
    title: string,
    parentUrl: string,
    description?: string,
    assignee?: string
  ) {
    const fields: Record<string, any> = {
      "System.Title": title,
      "System.Description": description || "",
    };
    if (assignee) {
      fields["System.AssignedTo"] = assignee;
    }
    const task = await this.createWorkItem(project, "Task", fields);

    // Link to User Story (parentUrl)
    await this.linkWorkItemsByUrl(
      parentUrl,
      task.id!,
      "System.LinkTypes.Hierarchy-Reverse"
    );
    return task;
  }

  async linkWorkItemsByUrl(
    parentUrl: string,
    childId: number,
    linkType: string
  ) {
    const api = await this.getApi();
    const patch = [
      {
        op: "add",
        path: "/relations/-",
        value: {
          rel: linkType,
          url: parentUrl,
        },
      },
    ];
    return api.updateWorkItem([], patch, childId);
  }

  async assignWorkItem(id: number, assignee: string) {
    return this.updateWorkItem(id, { "System.AssignedTo": assignee });
  }

  async getWorkItemStates(project: string, workItemType: string) {
    const api = await this.getApi();
    return api.getWorkItemTypeStates(project, workItemType);
  }

  async transitionWorkItem(id: number, newState: string) {
    return this.updateWorkItem(id, { "System.State": newState });
  }

  async getNextStates(id: number, action?: string) {
    const api = await this.getApi();
    return api.getWorkItemNextStatesOnCheckinAction([id], action);
  }

  async getTeamIterations(project: string, team: string) {
    const workApi = await this.getWorkApi();
    const teamContext: TeamContext = { project: project, team: team };
    return workApi.getTeamIterations(teamContext);
  }

  async getCurrentIteration(project: string, team?: string){
    const workApi = await this.getWorkApi();
    const teamContext: TeamContext = { project: project, team: team };
    return workApi.getTeamIterations(teamContext, 'current');
  }
  async assignToIteration(id: number, iterationId: string) {
    return this.updateWorkItem(id, { "System.IterationPath": iterationId });
  }

  async getIterationWorkItems(
    project: string,
    team: string,
    iterationId: string
  ) {
    const workApi = await this.getWorkApi();
    const teamContext: TeamContext = { project: project, team: team };
    return workApi.getIterationWorkItems(teamContext, iterationId);
  }

  async getTeamCapacity(project: string, team: string, iterationId: string) {
    const workApi = await this.getWorkApi();
    const teamContext: TeamContext = { project: project, team: team };
    return workApi.getCapacitiesWithIdentityRefAndTotals(
      teamContext,
      iterationId
    );
  }

  async getTeamSettings(project: string, team: string) {
    const workApi = await this.getWorkApi();
    const teamContext: TeamContext = { project: project, team: team };
    return workApi.getTeamSettings(teamContext);
  }

  async getBacklogWorkItems(project: string, team: string, backlogId: string) {
    const workApi = await this.getWorkApi();
    const teamContext: TeamContext = { project: project, team: team };
    return workApi.getBacklogLevelWorkItems(teamContext, backlogId);
  }

  async unlinkWorkItemsByUrl(
    parentUrl: string,
    childId: number,
    linkType: string = "System.LinkTypes.Hierarchy-Reverse"
  ) {
    const api = await this.getApi();
    const child = await api.getWorkItem(
      childId,
      undefined,
      undefined,
      undefined,
      undefined
    );
    if (!child.relations) throw new Error("No relations to remove");
    const index = child.relations.findIndex(
      (r) => r.url === parentUrl && (!linkType || r.rel === linkType)
    );
    if (index === -1) throw new Error("Relation not found");
    const patch = [
      {
        op: "remove",
        path: `/relations/${index}`,
      },
    ];
    return api.updateWorkItem([], patch, childId);
  }

  async getWorkItemsDetailsFromQueryResult(result: {workItems: {id: number}[]}) {
    const ids : number[]= result?.workItems?.map((wi: any) => wi.id) ?? [];
    if (ids.length === 0) return [];
    // note: azure api is not responding for very big arrays => we split into chunks and regroup.
    const chunks = splitIntoChunks(ids, 100);
    const response = [];
    for (let chunk of chunks){
        response.push(...await this.listWorkItems(chunk))
    }
    return response;
  }

  async bulkCreateWorkItems(payload: any) {
    const { project, items = [], batchSize = 3 } = payload;
    const results: any[] = [];
    const workItemService = this;

    async function createLevel(
      parentUrl: string | null,
      parentType: string | null,
      items: any[],
      batchSize: number
    ) {
      if (!items || items.length === 0) return;

      // Process items in batches for better performance
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map(async (item) => {
          let itemId = item.id;
          let itemUrl: string | null = null;
          let created = false;
          let title = item.title;
          let error = null;

          try {
            if (!itemId) {
              if (!title) throw new Error(`Missing title for new ${item.type}`);
              const fields = { "System.Title": title, ...(item.fields || {}) };
              const createdItem = await workItemService.createWorkItem(
                project,
                item.type,
                fields
              );
              itemId = createdItem.id;
              itemUrl = createdItem.url || null;
              created = true;

              if (parentUrl) {
                await workItemService.linkWorkItemsByUrl(
                  parentUrl,
                  itemId,
                  "System.LinkTypes.Hierarchy-Reverse"
                );
              }

              results.push({
                type: item.type,
                id: itemId,
                title,
                parentType,
                parentUrl,
                created: true,
                url: itemUrl,
              });
            } else {
              const existing = await workItemService.getWorkItemDetails(itemId);
              itemUrl = existing.url || null;
              title = existing.fields?.["System.Title"] || title;

              if (parentUrl) {
                await workItemService.linkWorkItemsByUrl(
                  parentUrl,
                  itemId,
                  "System.LinkTypes.Hierarchy-Reverse"
                );
              }

              results.push({
                type: item.type,
                id: itemId,
                title,
                parentType,
                parentUrl,
                created: false,
                url: itemUrl,
              });
            }

            // Process children recursively
            if (item.children && item.children.length > 0) {
              await createLevel(itemUrl, item.type, item.children, batchSize);
            }
          } catch (e: any) {
            error = (e as Error).message || String(e);
            results.push({
              type: item.type,
              id: itemId,
              title,
              parentType,
              parentUrl,
              created,
              error,
              url: itemUrl,
            });
          }
        });

        await Promise.all(batchPromises);
      }
    }

    await createLevel(null, null, items, batchSize);
    return results;
  }

  async deleteWorkItem(id: number, project: string) {
    const api = await this.getApi();
    return api.deleteWorkItem(id, project, false);
  }

  async deleteTeamIteration(
    project: string,
    team: string,
    iterationId: string
  ) {
    const workApi = await this.getWorkApi();
    const teamContext = { project, team };
    return workApi.deleteTeamIteration(teamContext, iterationId);
  }

  async createTeamIteration(
    project: string,
    team: string,
    name: string,
    startDate?: Date,
    finishDate?: Date
  ) {
    const workApi = await this.getWorkApi();
    const teamContext = { project, team };
    const iteration = {
      name,
      path: `${project}\\${name}`,
      attributes: {
        startDate,
        finishDate,
      },
    };
    return workApi.postTeamIteration(iteration, teamContext);
  }

  async createProjectIteration(
    project: string,
    name: string,
    startDate?: Date,
    finishDate?: Date
  ) {
    const api = await this.getApi();
    const path = `${project}\\${name}`;
    const postedNode = {
      name,
      attributes: {
        startDate,
        finishDate,
      },
    };
    return api.createOrUpdateClassificationNode(
      postedNode,
      project,
      TreeStructureGroup.Iterations,
      path
    );
  }

  async listProjectIterations(project: string) {
    const api = await this.getApi();
    return api.getClassificationNode(
      project,
      TreeStructureGroup.Iterations,
      "",
      5
    );
  }

  async updateProjectIterationDates(
    project: string,
    iterationPath: string,
    startDate?: Date,
    finishDate?: Date
  ) {
    const api = await this.getApi();
    const node = await api.getClassificationNode(
      project,
      TreeStructureGroup.Iterations,
      iterationPath
    );
    if (!node) throw new Error(`Iteration node not found: ${iterationPath}`);
    const postedNode = {
      name: node.name,
      attributes: {
        ...node.attributes,
        ...(startDate ? { startDate } : {}),
        ...(finishDate ? { finishDate } : {}),
      },
    };
    return api.createOrUpdateClassificationNode(
      postedNode,
      project,
      TreeStructureGroup.Iterations,
      iterationPath
    );
  }

  async getProjectIterationNodeById(project: string, id: number) {
    const api = await this.getApi();
    const nodes = await api.getClassificationNodes(project, [id], 1);
    return nodes && nodes.length > 0 ? nodes[0] : null;
  }

  async getWorkItemType(project: string, type: string) {
    const api = await this.getApi();

    const workItemType = await api.getWorkItemType(project, type);
    return workItemType;
  }
}
