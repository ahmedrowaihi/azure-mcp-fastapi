import {
  formatWorkItemSummary,
  formatWorkItemList,
  formatWorkItemTypeList,
  formatWorkItemQueryList,
} from "@formatters/workItem";
import { z } from "zod";

import type { WorkItemService } from "@azure/services/workItem";
import type { WorkItemType } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import type { FastMCP } from "fastmcp";

export function registerWorkItemTools(
  server: FastMCP,
  workItemService: WorkItemService
) {
  server.addTool({
    name: "listWorkItems",
    description: "List work items by IDs",
    parameters: z.object({ ids: z.array(z.number()) }),
    async execute(args) {
      const { ids } = args;
      const items = await workItemService.listWorkItems(ids);
      return JSON.stringify(formatWorkItemList(items));
    },
  });
  server.addTool({
    name: "getWorkItemDetails",
    description: "Get details for a work item by ID",
    parameters: z.object({ id: z.number() }),
    async execute(args) {
      const { id } = args;
      const w = await workItemService.getWorkItemDetails(id);
      return JSON.stringify(formatWorkItemSummary(w));
    },
  });
  server.addTool({
    name: "createWorkItem",
    description: "Create a new work item",
    parameters: z.object({
      project: z.string(),
      type: z.string(),
      fields: z.record(z.any()),
    }),
    async execute(args) {
      const { project, type, fields } = args;
      const w = await workItemService.createWorkItem(project, type, fields);
      return JSON.stringify(formatWorkItemSummary(w));
    },
  });
  server.addTool({
    name: "updateWorkItem",
    description: "Update a work item by ID",
    parameters: z.object({ id: z.number(), fields: z.record(z.any()) }),
    async execute(args) {
      const { id, fields } = args;
      const w = await workItemService.updateWorkItem(id, fields);
      return JSON.stringify(formatWorkItemSummary(w));
    },
  });
  server.addTool({
    name: "listWorkItemTypes",
    description: "List work item types for a project",
    parameters: z.object({ project: z.string() }),
    async execute(args) {
      const { project } = args;
      const types: WorkItemType[] = await workItemService.listWorkItemTypes(
        project
      );
      return JSON.stringify(formatWorkItemTypeList(types));
    },
  });
  server.addTool({
    name: "listWorkItemQueries",
    description: "List work item queries for a project",
    parameters: z.object({ project: z.string() }),
    async execute(args) {
      const { project } = args;
      const queries = await workItemService.listWorkItemQueries(project);
      return JSON.stringify(formatWorkItemQueryList(queries));
    },
  });
}
