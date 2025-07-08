import {
  formatBulkCreateResult,
  formatBulkUpdateResult,
  formatDestroyWorkItemsResult,
  formatIterationWorkItems,
  formatTeamCapacity,
  formatTeamIterations,
  formatWorkItemLinkResult,
  formatWorkItemList,
  formatWorkItemQueryList,
  formatWorkItemStates,
  formatWorkItemSummary,
  formatWorkItemSummaryList,
  formatWorkItemType,
  formatWorkItemTypeList,
} from "@formatters/workItem";
import { z } from "zod";

import type { WorkItemService } from "@azure/services/workItem";
import type { FastMCP } from "fastmcp";

// Add a reusable helper function to construct a work item URL
function getWorkItemUrl(project: string, id: number): string {
  const orgUrl = process.env.AZURE_ORG_URL?.replace(/\/$/, "");
  return `${orgUrl}/${project}/_apis/wit/workItems/${id}`;
}

export function registerWorkItemTools(
  server: FastMCP,
  workItemService: WorkItemService
) {
  // Work Item Types and Queries
  server.addTool({
    name: "workItem-type-list",
    description: `
      List all available work item types for a project, including their required and optional fields.
      Required parameters:
        - project: The Azure DevOps project name.
      Returns: Array of work item types with their names, descriptions, and available fields (with required/optional status).
      Example: {
        "project": "MyProject"
      }
      Output example:
      [
        {
          "name": "Epic",
          "description": "...",
          "fields": [
            { "name": "Title", "referenceName": "System.Title", "type": "string", "required": true },
            { "name": "Description", "referenceName": "System.Description", "type": "string", "required": false }
          ]
        },
        ...
      ]
    `,
    parameters: z.object({
      project: z.string().describe("The Azure DevOps project name."),
    }),
    async execute(args) {
      const { project } = args;
      const types = await workItemService.listWorkItemTypes(project);
      return JSON.stringify(formatWorkItemTypeList(types));
    },
  });

  server.addTool({
    name: "workItem-type-get",
    description: `
      List all available fields for a work item type.
      Required parameters:
        - project: The Azure DevOps project name.
        - type: The work item type (e.g., "Epic", "Feature", "User Story", "Task").
      Returns: Array of fields with their names, reference names, descriptions, required status, and allowed values.
      Example: { "project": "MyProject", "type": "Task" }

      --
      Note: if you want to get the work item types for a project, you can use the workItem.type.list tool.
    `,
    parameters: z.object({
      project: z.string().describe("The Azure DevOps project name."),
      type: z.string().describe("The work item type (e.g., Epic, Feature, User Story, Task)."),
    }),
    async execute(args) {
      const { project, type } = args;
      const workItemType = await workItemService.getWorkItemType(project, type);
      return JSON.stringify(formatWorkItemType(workItemType));
    },
  });

  server.addTool({
    name: "workItem-list-queries",
    description: `
      List all saved work item queries for a project.
      Required parameters:
        - project: The Azure DevOps project name (e.g., "MyProject").
      Returns: Array of saved queries with their IDs, names, and paths.
      Example: { "project": "MyProject" }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
    }),
    async execute(args) {
      const { project } = args;
      const queries = await workItemService.listWorkItemQueries(project);
      return JSON.stringify(formatWorkItemQueryList(queries));
    },
  });

  // Work Item CRUD Operations
  server.addTool({
    name: "workItem-create",
    description: `
      Create a new work item of any type (Epic, Feature, User Story, Task, Bug, etc.).
      Required parameters:
        - project: The Azure DevOps project name (e.g., "MyProject").
        - type: The work item type (e.g., "Epic", "Feature", "User Story", "Task").
        - fields: Object containing field values (e.g., { "System.Title": "My Task" }).
      Optional parameters:
        - parentUrl: The full URL of the parent work item (to create hierarchy).
      Returns: The created work item summary (id, fields, url).
      Example: {
        "project": "MyProject",
        "type": "Task",
        "fields": { "System.Title": "Write documentation", "System.Description": "Update README" },
        "parentUrl": "https://dev.azure.com/org/project/_apis/wit/workItems/123"
      }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      type: z.string().describe("The work item type (e.g., Epic, Feature, User Story, Task)."),
      fields: z.record(z.any()).describe("Object containing field values for the work item."),
      parentUrl: z.string().optional().describe("The full URL of the parent work item."),
    }),
    async execute(args) {
      const { project, type, fields, parentUrl } = args;
      const workItem = await workItemService.createWorkItem(project, type, fields);
      
      if (parentUrl) {
        await workItemService.linkWorkItemsByUrl(
          parentUrl,
          workItem.id!,
          "System.LinkTypes.Hierarchy-Reverse"
        );
      }
      
      return JSON.stringify(formatWorkItemSummary(workItem));
    },
  });

  server.addTool({
    name: "workItem-update",
    description: `
      Update an existing work item with new field values. Can be used for assignment, state transitions, and any field updates.
      Required parameters:
        - id: The work item ID to update.
        - fields: Object containing field values to update (e.g., { "System.AssignedTo": "user@example.com", "System.State": "In Progress" }).
      Returns: The updated work item summary.
      Example: {
        "id": 12345,
        "fields": { 
          "System.AssignedTo": "user@example.com",
          "System.State": "In Progress",
          "System.Title": "Updated Title"
        }
      }
    `,
    parameters: z.object({
      id: z.number().describe("The ID of the work item to update."),
      fields: z.record(z.any()).describe("Object containing field values to update."),
    }),
    async execute(args) {
      const { id, fields } = args;
      const workItem = await workItemService.updateWorkItem(id, fields);
      return JSON.stringify(formatWorkItemSummary(workItem));
    },
  });

  server.addTool({
    name: "workItem-delete",
    description: `
      Permanently delete (destroy) work items. This action is IRREVERSIBLE and cannot be undone.
      Required parameters:
        - project: The Azure DevOps project name.
        - ids: Array of work item IDs to permanently delete.
      Optional parameters:
        - batchSize: Number of work items to delete in parallel (default: 5, max: 20).
      Returns: Detailed results with summary statistics showing success/failure for each deletion.
      Example: { "project": "MyProject", "ids": [123, 456, 789], "batchSize": 10 }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      ids: z.array(z.number()).describe("List of work item IDs to permanently delete."),
      batchSize: z.number().optional().describe("Number of work items to delete in parallel (default: 5, max: 20)."),
    }),
    async execute({ project, ids, batchSize = 5 }) {
      const maxBatchSize = Math.min(batchSize, 20); // Cap at 20 for performance
      const results = [];
      
      // Process deletions in batches for better performance
      for (let i = 0; i < ids.length; i += maxBatchSize) {
        const batch = ids.slice(i, i + maxBatchSize);
        const batchPromises = batch.map(async (id) => {
          try {
            await workItemService.deleteWorkItem(id, project);
            return { id, success: true };
          } catch (error) {
            return {
              id,
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      const summary = {
        total: ids.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        errors: results.filter(r => !r.success).map(r => ({ id: r.id, error: r.error }))
      };
      
      return JSON.stringify({
        summary,
        results: formatDestroyWorkItemsResult(results)
      });
    },
  });

  // Work Item Querying and Listing
  server.addTool({
    name: "workItem-list",
    description: `
      List work items using various filtering options. Can query by WIQL, filter by type/assignee, or get all work items in a project.
      Required parameters:
        - project: The Azure DevOps project name.
      Optional parameters:
        - wiql: WIQL query string for custom filtering.
        - types: Array of work item types to filter by (e.g., ["Task", "Bug"]).
        - assignedTo: Filter by assigned user (exact match required).
        - top: Maximum number of results to return.
      Returns: Array of work items matching the criteria.
      Examples:
        - List all tasks: { "project": "MyProject", "types": ["Task"] }
        - Custom WIQL: { "project": "MyProject", "wiql": "SELECT [System.Id] FROM WorkItems WHERE [System.State] = 'Active'" }
        - Assigned to user: { "project": "MyProject", "assignedTo": "user@example.com" }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      wiql: z.string().optional().describe("WIQL query string for custom filtering."),
      types: z.array(z.string()).optional().describe("Array of work item types to filter by."),
      assignedTo: z.string().optional().describe("Filter by assigned user (exact match required)."),
      top: z.number().optional().describe("Maximum number of results to return."),
    }),
    async execute(args) {
      const { project, wiql, types, assignedTo, top } = args;
      
      let queryWiql = wiql;
      if (!queryWiql) {
        queryWiql = `SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], [System.AreaPath], [System.IterationPath] FROM WorkItems WHERE [System.AreaPath] = '${project}'`;
        if (types && types.length > 0) {
          const typeList = types.map((t) => `'${t.replace(/'/g, "''")}'`).join(", ");
          queryWiql += ` AND [System.WorkItemType] IN (${typeList})`;
        }
        if (assignedTo) {
          queryWiql += ` AND [System.AssignedTo] = '${assignedTo.replace(/'/g, "''")}'`;
        }
      }
      
      const result = await workItemService.queryWorkItems(project, queryWiql, top);
      const items = await workItemService.getWorkItemsDetailsFromQueryResult(result);
      return JSON.stringify(formatWorkItemList(items));
    },
  });

  server.addTool({
    name: "workItem.executeQuery",
    description: `
      Execute a saved work item query by its ID.
      Required parameters:
        - project: The Azure DevOps project name.
        - queryId: The ID of the saved query to execute.
      Optional parameters:
        - top: Maximum number of results to return.
      Returns: Array of work items from the query result.
      Example: { "project": "MyProject", "queryId": "12345678-1234-1234-1234-123456789012" }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      queryId: z.string().describe("The ID of the saved query to execute."),
      top: z.number().optional().describe("Maximum number of results to return."),
    }),
    async execute(args) {
      const { project, queryId, top } = args;
      const result = await workItemService.executeQuery(project, queryId, top);
      const items = await workItemService.getWorkItemsDetailsFromQueryResult(result);
      return JSON.stringify(formatWorkItemList(items));
    },
  });

  server.addTool({
    name: "workItem-bulk-query",
    description: `
      Execute multiple WIQL queries in parallel for better performance when querying large datasets.
      Required parameters:
        - project: The Azure DevOps project name.
        - queries: Array of query objects with name and wiql.
      Optional parameters:
        - top: Maximum number of work items per query (default: 100, max: 1000).
        - batchSize: Number of queries to execute in parallel (default: 5, max: 10).
      Returns: Results for each query with summary statistics.
      Example: {
        "project": "MyProject",
        "queries": [
          { "name": "Active Bugs", "wiql": "SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'Bug' AND [System.State] = 'Active'" },
          { "name": "In Progress Stories", "wiql": "SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'User Story' AND [System.State] = 'In Progress'" }
        ],
        "top": 200,
        "batchSize": 3
      }
    `,
    parameters: z.object({
      project: z.string().describe("The Azure DevOps project name."),
      queries: z.array(
        z.object({
          name: z.string().describe("Name/identifier for this query."),
          wiql: z.string().describe("The WIQL query string."),
        })
      ).describe("Array of query objects to execute."),
      top: z.number().optional().describe("Maximum number of work items per query (default: 100, max: 1000)."),
      batchSize: z.number().optional().describe("Number of queries to execute in parallel (default: 5, max: 10)."),
    }),
    async execute(args) {
      const { project, queries, top = 100, batchSize = 5 } = args;
      const maxTop = Math.min(top, 1000);
      const maxBatchSize = Math.min(batchSize, 10);
      const results = [];
      
      // Process queries in batches
      for (let i = 0; i < queries.length; i += maxBatchSize) {
        const batch = queries.slice(i, i + maxBatchSize);
        const batchPromises = batch.map(async (query) => {
          try {
            const result = await workItemService.queryWorkItems(project, query.wiql, maxTop);
            const items = await workItemService.getWorkItemsDetailsFromQueryResult(result);
            return {
              name: query.name,
              success: true,
              count: items?.length || 0,
              result: formatWorkItemList(items)
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              name: query.name,
              success: false,
              error: errorMessage,
              count: 0,
              result: null
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      const summary = {
        totalQueries: queries.length,
        successfulQueries: results.filter(r => r.success).length,
        failedQueries: results.filter(r => !r.success).length,
        totalWorkItems: results.reduce((sum, r) => sum + r.count, 0),
        errors: results.filter(r => !r.success).map(r => ({ name: r.name, error: r.error }))
      };
      
      return JSON.stringify({
        summary,
        results
      });
    },
  });

  // Work Item States
  server.addTool({
    name: "workItem-list-states",
    description: `
      Get available states for a specific work item type.
      Required parameters:
        - project: The Azure DevOps project name.
        - workItemType: The work item type (e.g., "Epic", "Feature", "User Story", "Task").
      Returns: Array of available states with their names, colors, and categories.
      Example: { "project": "MyProject", "workItemType": "Task" }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      workItemType: z.string().describe("The work item type (e.g., Epic, Feature, User Story, Task)."),
    }),
    async execute(args) {
      const { project, workItemType } = args;
      const states = await workItemService.getWorkItemStates(project, workItemType);
      return JSON.stringify(formatWorkItemStates(states));
    },
  });

  // Work Item Linking
  server.addTool({
    name: "workItem-link",
    description: `
      Link an existing child work item to a parent by ID (creates parent-child relationship).
      Required parameters:
        - project: The Azure DevOps project name.
        - parentId: The ID of the parent work item.
        - childId: The ID of the child work item to link.
      Optional parameters:
        - linkType: The link type to use (default: System.LinkTypes.Hierarchy-Reverse).
      Returns: The updated work item with new relations.
      Example: {
        "project": "MyProject",
        "parentId": 123,
        "childId": 456
      }
    `,
    parameters: z.object({
      project: z.string().describe("The Azure DevOps project name."),
      parentId: z.number().describe("The ID of the parent work item."),
      childId: z.number().describe("The ID of the child work item to link."),
      linkType: z.string().optional().describe("The link type to use (default: System.LinkTypes.Hierarchy-Reverse)."),
    }),
    async execute(args) {
      const { project, parentId, childId, linkType } = args;
      const result = await workItemService.linkWorkItemsByUrl(
        getWorkItemUrl(project, parentId),
        childId,
        linkType || "System.LinkTypes.Hierarchy-Reverse"
      );
      return JSON.stringify(formatWorkItemLinkResult(result));
    },
  });

  server.addTool({
    name: "workItem-unlink",
    description: `
      Unlink a child work item from a parent by ID (removes parent-child relationship).
      Required parameters:
        - project: The Azure DevOps project name.
        - parentId: The ID of the parent work item.
        - childId: The ID of the child work item to unlink.
      Optional parameters:
        - linkType: The link type to remove (default: System.LinkTypes.Hierarchy-Reverse).
      Returns: The updated work item with relations removed.
      Example: {
        "project": "MyProject",
        "parentId": 123,
        "childId": 456
      }
    `,
    parameters: z.object({
      project: z.string().describe("The Azure DevOps project name."),
      parentId: z.number().describe("The ID of the parent work item."),
      childId: z.number().describe("The ID of the child work item to unlink."),
      linkType: z.string().optional().describe("The link type to remove (default: System.LinkTypes.Hierarchy-Reverse)."),
    }),
    async execute(args) {
      const { project, parentId, childId, linkType } = args;
      const result = await workItemService.unlinkWorkItemsByUrl(
        getWorkItemUrl(project, parentId),
        childId,
        linkType || "System.LinkTypes.Hierarchy-Reverse"
      );
      return JSON.stringify(formatWorkItemLinkResult(result));
    },
  });

  // Bulk Operations
  server.addTool({
    name: "workItem-bulk-create",
    description: `
      Bulk create work items with hierarchical relationships. Supports creating any work item types with parent/child relationships.
      Required parameters:
        - project: The Azure DevOps project name.
        - items: Array of work item objects with optional children.
      Optional parameters:
        - batchSize: Number of items to process in parallel (default: 3, max: 10).
      Returns: Detailed results with summary statistics showing success/failure for each item.
      Example: {
        "project": "MyProject",
        "items": [
          {
            "type": "Epic",
            "title": "Epic 1",
            "fields": { "System.Description": "Epic description" },
            "children": [
              {
                "type": "Feature",
                "title": "Feature A",
                "children": [
                  {
                    "type": "User Story",
                    "title": "Story 1",
                    "children": [
                      { "type": "Task", "title": "Task X" },
                      { "type": "Task", "title": "Task Y" }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        "batchSize": 5
      }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      items: z.array(
        z.object({
          type: z.string().describe("The work item type (e.g., Epic, Feature, User Story, Task)."),
          id: z.number().optional().describe("Existing work item ID to link to (instead of creating new)."),
          title: z.string().optional().describe("Title for the work item (required if creating new)."),
          fields: z.record(z.any()).optional().describe("Additional fields for the work item."),
          children: z.array(z.lazy(() => z.any())).optional().describe("Child work items with the same structure."),
        })
      ).describe("Array of work item objects to create with optional children."),
      batchSize: z.number().optional().describe("Number of items to process in parallel (default: 3, max: 10)."),
    }),
    async execute(args) {
      const { project, items, batchSize = 3 } = args;
      const maxBatchSize = Math.min(batchSize, 10); // Cap at 10 for performance
      
      try {
        const results = await workItemService.bulkCreateWorkItems({
          project,
          items,
          batchSize: maxBatchSize
        });
        return JSON.stringify(formatBulkCreateResult(results));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return JSON.stringify({
          summary: {
            total: 0,
            created: 0,
            linked: 0,
            failed: 1,
            errors: [{ type: "BULK_CREATE", title: "Bulk Create Failed", error: errorMessage }]
          },
          results: []
        });
      }
    },
  });

  server.addTool({
      name: "workItem-bulk-update",
    description: `
      Bulk update work items with multiple actions: assign, change state, set iteration, add comment, or update custom fields.
      Required parameters:
        - ids: Array of work item IDs to update.
        - actions: Array of actions to perform on each work item.
      Optional parameters:
        - batchSize: Number of work items to process in parallel (default: 5, max: 20).
        - summary: If true, return summary output; if false, return full work item details (default: true).
      Returns: Detailed results with summary statistics showing success/failure for each action on each work item.
      Example: {
        "ids": [123, 456, 789],
        "actions": [
          { "action": "assign", "value": "user@example.com" },
          { "action": "state", "value": "In Progress" },
          { "action": "comment", "value": "Bulk updated", "project": "MyProject" }
        ],
        "batchSize": 10
      }
    `,
    parameters: z.object({
      ids: z.array(z.number()).describe("List of work item IDs to update."),
      actions: z.array(
        z.object({
          action: z.enum(["assign", "state", "iteration", "field"]).describe("The action to perform."),
          value: z.string().describe("The value for the action (user, state, iteration, or field value)."),
          field: z.string().optional().describe("The field reference name to update (required for 'field' action)."),
          project: z.string().optional().describe("The project name (required for comment action)."),
        })
      ).describe("Array of actions to perform on each work item."),
      batchSize: z.number().optional().describe("Number of work items to process in parallel (default: 5, max: 20)."),
      summary: z.boolean().optional().describe("If true, return summary output; if false, return full work item details. Default: true."),
    }),
    async execute(args) {
      const { ids, actions, batchSize = 5, summary = true } = args;
      const maxBatchSize = Math.min(batchSize, 20); // Cap at 20 for performance
      const results = [];
      const successIds = new Set<number>();
      
      // Process work items in batches for better performance
      for (let i = 0; i < ids.length; i += maxBatchSize) {
        const batch = ids.slice(i, i + maxBatchSize);
        const batchPromises = batch.map(async (id) => {
          const actionResults = [];
          let allSuccess = true;
          
          for (const act of actions) {
            try {
              let result;
              if (act.action === "assign") {
                result = await workItemService.assignWorkItem(id, act.value);
              } else if (act.action === "state") {
                result = await workItemService.transitionWorkItem(id, act.value);
              } else if (act.action === "iteration") {
                result = await workItemService.assignToIteration(id, act.value);
              } else if (act.action === "field") {
                if (!act.field) throw new Error("Field is required for field action");
                const fields: Record<string, any> = {};
                fields[act.field] = act.value;
                result = await workItemService.updateWorkItem(id, fields);
              }
              
              actionResults.push({
                action: act.action,
                field: act.field,
                success: true,
              });
            } catch (e: any) {
              actionResults.push({
                action: act.action,
                field: act.field,
                success: false,
                error: e.message,
              });
              allSuccess = false;
            }
          }
          
          if (allSuccess) successIds.add(id);
          return { id, actions: actionResults };
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      // Get updated work item details if requested
      let summaryOut: any[] = [];
      let detailsOut: any[] = [];
      if (successIds.size > 0) {
        try {
          const items = await workItemService.listWorkItems(Array.from(successIds));
          if (summary) {
            summaryOut = formatWorkItemSummaryList(items);
          } else {
            detailsOut = items;
          }
        } catch (error) {
          // If we can't fetch the updated items, continue without them
          console.warn("Could not fetch updated work item details:", error);
        }
      }
      
      return JSON.stringify({
        ...formatBulkUpdateResult(results),
        summary: summaryOut,
        details: detailsOut,
      });
    },
  });

  // Iteration Tools
  server.addTool({
    name: "iteration-list",
    description: `
      List all iterations (sprints) currently assigned to a team.
      Required parameters:
        - project: The Azure DevOps project name.
        - team: The team name.
      Returns: Array of iterations with their names, IDs, and dates.
      Example: { "project": "MyProject", "team": "Development Team" }
    `,
    parameters: z.object({
      project: z.string().describe("Azure DevOps project name."),
      team: z.string().describe("Team name."),
    }),
    async execute(args) {
      const { project, team } = args;
      const iterations = await workItemService.getTeamIterations(project, team);
      return JSON.stringify(formatTeamIterations(iterations));
    },
  });

  server.addTool({
    name: "iteration-create",
    description: `
      Create a team iteration (sprint) for a project and team.
      Required parameters:
        - project: The Azure DevOps project name.
        - team: The team name.
        - name: The name of the iteration (sprint).
      Optional parameters:
        - startDate: Start date (YYYY-MM-DD) of the iteration.
        - finishDate: Finish date (YYYY-MM-DD) of the iteration.
      Returns: Confirmation message with created iteration details.
      Example: {
        "project": "MyProject",
        "team": "Development Team",
        "name": "Sprint 1",
        "startDate": "2024-01-01",
        "finishDate": "2024-01-15"
      }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      team: z.string().describe("The name of the team."),
      name: z.string().describe("The name of the iteration (sprint)."),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD) of the iteration."),
      finishDate: z.string().optional().describe("Finish date (YYYY-MM-DD) of the iteration."),
    }),
    async execute({ project, team, name, startDate, finishDate }) {
      // Step 1: Create project-level iteration node
      const projectIteration = await workItemService.createProjectIteration(
        project,
        name,
        startDate ? new Date(startDate) : undefined,
        finishDate ? new Date(finishDate) : undefined
      );
      // Step 2: Assign iteration to team
      const teamIteration = await workItemService.createTeamIteration(
        project,
        team,
        name,
        startDate ? new Date(startDate) : undefined,
        finishDate ? new Date(finishDate) : undefined
      );
      return `Project iteration '${projectIteration.name}' created. Team iteration '${teamIteration.name}' assigned with id ${teamIteration.id}.`;
    },
  });

  server.addTool({
    name: "iteration-delete",
    description: `
      Delete one or more team iterations by ID.
      Required parameters:
        - project: The Azure DevOps project name.
        - team: The team name.
        - ids: Array of iteration IDs to delete.
      Returns: Array of results showing success/failure for each iteration.
      Example: { "project": "MyProject", "team": "Development Team", "ids": ["iteration1", "iteration2"] }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      team: z.string().describe("The name of the team."),
      ids: z.array(z.string()).describe("List of iteration IDs to delete."),
    }),
    async execute({ project, team, ids }) {
      const results = [];
      for (const id of ids) {
        try {
          await workItemService.deleteTeamIteration(project, team, id);
          results.push({ id, deleted: true });
        } catch (error) {
          results.push({
            id,
            deleted: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return JSON.stringify(results);
    },
  });

  server.addTool({
    name: "iteration-assign",
    description: `
      Assign a work item to a team iteration (sprint).
      Required parameters:
        - id: The work item ID.
        - iterationId: The team iteration path (e.g., 'ProjectName\\Iteration 1').
      Returns: The updated work item summary.
      Example: { "id": 12345, "iterationId": "MyProject\\Sprint 1" }
    `,
    parameters: z.object({
      id: z.number().describe("Work item ID."),
      iterationId: z.string().describe("Team iteration path (e.g., 'ProjectName\\Iteration 1')."),
    }),
    async execute(args) {
      const { id, iterationId } = args;
      const workItem = await workItemService.assignToIteration(id, iterationId);
      return JSON.stringify(formatWorkItemSummary(workItem));
    },
  });

  server.addTool({
    name: "iteration-list-work-items",
    description: `
      List all work items assigned to a specific team iteration (sprint).
      Required parameters:
        - project: The Azure DevOps project name.
        - team: The team name.
        - iterationId: The team iteration path.
      Returns: Array of work items assigned to the iteration.
      Example: { "project": "MyProject", "team": "Development Team", "iterationId": "MyProject\\Sprint 1" }
    `,
    parameters: z.object({
      project: z.string().describe("Azure DevOps project name."),
      team: z.string().describe("Team name."),
      iterationId: z.string().describe("Team iteration path (e.g., 'ProjectName\\Iteration 1')."),
    }),
    async execute(args) {
      const { project, team, iterationId } = args;
      const result = await workItemService.getIterationWorkItems(project, team, iterationId);
      return JSON.stringify(formatIterationWorkItems(result));
    },
  });

  server.addTool({
    name: "iteration-update-dates",
    description: `
      Update the start and end dates for a project-level iteration node (affects all teams using this iteration).
      Required parameters:
        - project: The Azure DevOps project name.
        - iterationPath: The project-level iteration path (e.g., 'ProjectName\\Iteration 1').
      Optional parameters:
        - startDate: Start date (YYYY-MM-DD).
        - finishDate: Finish date (YYYY-MM-DD).
      Returns: Updated iteration details.
      Example: {
        "project": "MyProject",
        "iterationPath": "MyProject\\Sprint 1",
        "startDate": "2024-01-01",
        "finishDate": "2024-01-15"
      }
    `,
    parameters: z.object({
      project: z.string().describe("Azure DevOps project name."),
      iterationPath: z.string().describe("Project-level iteration path (e.g., 'ProjectName\\Iteration 1')."),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)."),
      finishDate: z.string().optional().describe("Finish date (YYYY-MM-DD)."),
    }),
    async execute({ project, iterationPath, startDate, finishDate }) {
      const updated = await workItemService.updateProjectIterationDates(
        project,
        iterationPath,
        startDate ? new Date(startDate) : undefined,
        finishDate ? new Date(finishDate) : undefined
      );
      return JSON.stringify({
        id: updated.id,
        name: updated.name,
        startDate: updated.attributes?.startDate,
        finishDate: updated.attributes?.finishDate,
      });
    },
  });

  // Team Capacity
  server.addTool({
    name: "team-capacity",
    description: `
      Get team capacity for an iteration.
      Required parameters:
        - project: The Azure DevOps project name.
        - team: The team name.
        - iterationId: The ID or path of the iteration/sprint.
      Returns: Team capacity information including member activities and days off.
      Example: { "project": "MyProject", "team": "Development Team", "iterationId": "MyProject\\Sprint 1" }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      team: z.string().describe("The name of the team."),
      iterationId: z.string().describe("The ID or path of the iteration/sprint."),
    }),
    async execute(args) {
      const { project, team, iterationId } = args;
      const capacity = await workItemService.getTeamCapacity(project, team, iterationId);
      return JSON.stringify(formatTeamCapacity(capacity));
    },
  });

  // Project Iterations (for debugging/advanced use)
  server.addTool({
    name: "iteration-list-project",
    description: `
      List all project-level iteration nodes for a project.
      Required parameters:
        - project: The Azure DevOps project name.
      Returns: Summary of iteration names and paths.
      Example: { "project": "MyProject" }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
    }),
    async execute({ project }) {
      const root = await workItemService.listProjectIterations(project);
      return JSON.stringify(root);
    },
  });

  server.addTool({
    name: "iteration-get-by-id",
    description: `
      Fetch a project-level iteration node by its numeric ID (for debugging).
      Required parameters:
        - project: The Azure DevOps project name.
        - id: The numeric ID of the iteration node.
      Returns: The node's name, path, and attributes.
      Example: { "project": "MyProject", "id": 12345 }
    `,
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      id: z.number().describe("The numeric ID of the iteration node."),
    }),
    async execute({ project, id }) {
      const node = await workItemService.getProjectIterationNodeById(project, id);
      if (!node) return `Node not found for id ${id}`;
      return JSON.stringify({
        name: node.name,
        path: node.path,
        attributes: node.attributes,
      });
    },
  });
}
