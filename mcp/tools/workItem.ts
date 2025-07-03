import {
  formatWorkItemSummary,
  formatWorkItemTypeList,
  formatWorkItemQueryList,
  formatWorkItemQueryResult,
  formatWorkItemStates,
  formatTeamIterations,
  formatTeamCapacity,
  formatIterationWorkItems,
  formatCommentList,
  formatComment,
  formatWorkItemLinkResult,
  formatWorkItemList,
  formatWorkItemSummaryList,
  formatBulkCreateResult,
  formatDestroyWorkItemsResult,
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
    name: "listWorkItemTypes",
    description: "List work item types for a project",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
    }),
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
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
    }),
    async execute(args) {
      const { project } = args;
      const queries = await workItemService.listWorkItemQueries(project);
      return JSON.stringify(formatWorkItemQueryList(queries));
    },
  });

  server.addTool({
    name: "queryWorkItems",
    description: "Query work items using WIQL (Work Item Query Language)",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      wiql: z.string().describe("The WIQL query string."),
      top: z
        .number()
        .optional()
        .describe("Maximum number of results to return."),
    }),
    async execute(args) {
      const { project, wiql, top } = args;
      const result = await workItemService.queryWorkItems(project, wiql, top);
      const items = await workItemService.getWorkItemsDetailsFromQueryResult(
        result
      );
      return JSON.stringify(formatWorkItemList(items));
    },
  });

  server.addTool({
    name: "executeQuery",
    description: "Execute a saved work item query by ID",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      queryId: z.string().describe("The ID of the saved query to execute."),
      top: z
        .number()
        .optional()
        .describe("Maximum number of results to return."),
    }),
    async execute(args) {
      const { project, queryId, top } = args;
      const result = await workItemService.executeQuery(project, queryId, top);
      const items = await workItemService.getWorkItemsDetailsFromQueryResult(
        result
      );
      return JSON.stringify(formatWorkItemList(items));
    },
  });

  server.addTool({
    name: "createEpic",
    description: "Create a new Epic work item",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      title: z.string().describe("The title of the Epic."),
      description: z
        .string()
        .optional()
        .describe("A description for the Epic."),
      areaPath: z.string().optional().describe("The area path for the Epic."),
    }),
    async execute(args) {
      const { project, title, description, areaPath } = args;
      const epic = await workItemService.createEpic(
        project,
        title,
        description,
        areaPath
      );
      return JSON.stringify(formatWorkItemSummary(epic));
    },
  });

  server.addTool({
    name: "createFeature",
    description: "Create a new Feature work item linked to an Epic",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      title: z.string().describe("The title of the Feature."),
      parentUrl: z
        .string()
        .describe("The full URL of the parent Epic work item."),
      description: z
        .string()
        .optional()
        .describe("A description for the Feature."),
    }),
    async execute(args) {
      const { project, title, parentUrl, description } = args;
      const feature = await workItemService.createFeature(
        project,
        title,
        parentUrl,
        description
      );
      return JSON.stringify(formatWorkItemSummary(feature));
    },
  });

  server.addTool({
    name: "createUserStory",
    description: "Create a new User Story work item linked to a Feature",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      title: z.string().describe("The title of the User Story."),
      parentUrl: z
        .string()
        .describe("The full URL of the parent Feature work item."),
      description: z
        .string()
        .optional()
        .describe("A description for the User Story."),
      storyPoints: z
        .number()
        .optional()
        .describe("Story points estimate for the User Story."),
    }),
    async execute(args) {
      const { project, title, parentUrl, description, storyPoints } = args;
      const story = await workItemService.createUserStory(
        project,
        title,
        parentUrl,
        description,
        storyPoints
      );
      return JSON.stringify(formatWorkItemSummary(story));
    },
  });

  server.addTool({
    name: "createTask",
    description: "Create a new Task work item linked to a User Story",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      title: z.string().describe("The title of the Task."),
      parentUrl: z
        .string()
        .describe("The full URL of the parent User Story work item."),
      description: z
        .string()
        .optional()
        .describe("A description for the Task."),
      assignee: z
        .string()
        .optional()
        .describe("The user to assign the Task to."),
    }),
    async execute(args) {
      const { project, title, parentUrl, description, assignee } = args;
      const task = await workItemService.createTask(
        project,
        title,
        parentUrl,
        description,
        assignee
      );
      return JSON.stringify(formatWorkItemSummary(task));
    },
  });

  server.addTool({
    name: "assignWorkItem",
    description: "Assign a work item to a team member",
    parameters: z.object({
      id: z.number().describe("The ID of the work item to assign."),
      assignee: z.string().describe("The user to assign the work item to."),
    }),
    async execute(args) {
      const { id, assignee } = args;
      const workItem = await workItemService.assignWorkItem(id, assignee);
      return JSON.stringify(formatWorkItemSummary(workItem));
    },
  });

  server.addTool({
    name: "getWorkItemStates",
    description: "Get available states for a work item type",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      workItemType: z
        .string()
        .describe(
          "The work item type (e.g., Epic, Feature, User Story, Task)."
        ),
    }),
    async execute(args) {
      const { project, workItemType } = args;
      const states = await workItemService.getWorkItemStates(
        project,
        workItemType
      );
      return JSON.stringify(formatWorkItemStates(states));
    },
  });

  server.addTool({
    name: "transitionWorkItem",
    description: "Transition a work item to a new state",
    parameters: z.object({
      id: z.number().describe("The ID of the work item to transition."),
      newState: z
        .string()
        .describe("The new state to transition the work item to."),
    }),
    async execute(args) {
      const { id, newState } = args;
      const workItem = await workItemService.transitionWorkItem(id, newState);
      return JSON.stringify(formatWorkItemSummary(workItem));
    },
  });

  server.addTool({
    name: "getTeamIterations",
    description:
      "List all iterations (sprints) currently assigned to a team. Usage: Provide project and team name. Returns iteration names, IDs, and dates.",
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
    name: "assignToIteration",
    description:
      "Assign a work item to a team iteration (sprint). Only works for iterations assigned to the team. Usage: Provide work item ID and the team iteration path (e.g. 'ProjectName\\Iteration 1').",
    parameters: z.object({
      id: z.number().describe("Work item ID."),
      iterationId: z
        .string()
        .describe("Team iteration path (e.g. 'ProjectName\\Iteration 1')."),
    }),
    async execute(args) {
      const { id, iterationId } = args;
      const workItem = await workItemService.assignToIteration(id, iterationId);
      return JSON.stringify(formatWorkItemSummary(workItem));
    },
  });

  server.addTool({
    name: "getIterationWorkItems",
    description:
      "List all work items assigned to a specific team iteration (sprint). Usage: Provide project, team, and iteration path.",
    parameters: z.object({
      project: z.string().describe("Azure DevOps project name."),
      team: z.string().describe("Team name."),
      iterationId: z
        .string()
        .describe("Team iteration path (e.g. 'ProjectName\\Iteration 1')."),
    }),
    async execute(args) {
      const { project, team, iterationId } = args;
      const result = await workItemService.getIterationWorkItems(
        project,
        team,
        iterationId
      );
      return JSON.stringify(formatIterationWorkItems(result));
    },
  });

  server.addTool({
    name: "getTeamCapacity",
    description: "Get team capacity for an iteration",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      team: z.string().describe("The name of the team."),
      iterationId: z
        .string()
        .describe("The ID or path of the iteration/sprint."),
    }),
    async execute(args) {
      const { project, team, iterationId } = args;
      const capacity = await workItemService.getTeamCapacity(
        project,
        team,
        iterationId
      );
      return JSON.stringify(formatTeamCapacity(capacity));
    },
  });

  server.addTool({
    name: "addComment",
    description: "Add a comment to a work item",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      workItemId: z.number().describe("The ID of the work item to comment on."),
      comment: z.string().describe("The comment text."),
    }),
    async execute(args) {
      const { project, workItemId, comment } = args;
      const result = await workItemService.addComment(
        project,
        workItemId,
        comment
      );
      return JSON.stringify(formatComment(result));
    },
  });

  server.addTool({
    name: "getComments",
    description: "Get comments for a work item",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      workItemId: z
        .number()
        .describe("The ID of the work item to get comments for."),
      top: z
        .number()
        .optional()
        .describe("Maximum number of comments to return."),
    }),
    async execute(args) {
      const { project, workItemId, top } = args;
      const comments = await workItemService.getComments(
        project,
        workItemId,
        top
      );
      return JSON.stringify(formatCommentList(comments));
    },
  });

  server.addTool({
    name: "linkWorkItems",
    description:
      "Link an existing child work item to a parent by URL (parent-child relationship)",
    parameters: z.object({
      parentUrl: z
        .string()
        .describe(
          "The full URL of the parent work item (Epic, Feature, or User Story)."
        ),
      childId: z
        .number()
        .describe(
          "The ID of the child work item to link (Feature, User Story, or Task)."
        ),
      linkType: z
        .string()
        .optional()
        .describe(
          "The link type to use (default: System.LinkTypes.Hierarchy-Reverse)."
        ),
    }),
    async execute(args) {
      const { parentUrl, childId, linkType } = args;
      const result = await workItemService.linkWorkItemsByUrl(
        parentUrl,
        childId,
        linkType || "System.LinkTypes.Hierarchy-Reverse"
      );
      return JSON.stringify(formatWorkItemLinkResult(result));
    },
  });

  server.addTool({
    name: "unlinkWorkItems",
    description:
      "Unlink a child work item from a parent by URL (removes parent-child relationship)",
    parameters: z.object({
      parentUrl: z
        .string()
        .describe(
          "The full URL of the parent work item (Epic, Feature, or User Story)."
        ),
      childId: z
        .number()
        .describe(
          "The ID of the child work item to unlink (Feature, User Story, or Task)."
        ),
      linkType: z
        .string()
        .optional()
        .describe(
          "The link type to remove (default: System.LinkTypes.Hierarchy-Reverse)."
        ),
    }),
    async execute(args) {
      const { parentUrl, childId, linkType } = args;
      const result = await workItemService.unlinkWorkItemsByUrl(
        parentUrl,
        childId,
        linkType || "System.LinkTypes.Hierarchy-Reverse"
      );
      return JSON.stringify(formatWorkItemLinkResult(result));
    },
  });

  server.addTool({
    name: "bulkUpdateWorkItems",
    description:
      "Bulk update work items: assign, change state, set iteration, add comment, or custom field. Supports multiple actions per call.",
    parameters: z.object({
      ids: z.array(z.number()).describe("List of work item IDs to update."),
      actions: z
        .array(
          z.object({
            action: z
              .enum(["assign", "state", "iteration", "comment", "field"])
              .describe("The action to perform."),
            value: z
              .string()
              .describe(
                "The value for the action (user, state, iteration, comment, or field value)."
              ),
            field: z
              .string()
              .optional()
              .describe(
                "The field reference name to update (required for 'field' action)."
              ),
            project: z
              .string()
              .optional()
              .describe("The project name (required for comment action)."),
          })
        )
        .describe("Array of actions to perform on each work item."),
      summary: z
        .boolean()
        .optional()
        .describe(
          "If true, return summary output; if false, return full work item details. Default: true."
        ),
    }),
    async execute(args) {
      const { ids, actions, summary = true } = args;
      const results = [];
      const successIds = new Set<number>();
      for (const id of ids) {
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
            } else if (act.action === "comment") {
              if (!act.project)
                throw new Error("Project is required for comment action");
              result = await workItemService.addComment(
                act.project,
                id,
                act.value
              );
            } else if (act.action === "field") {
              if (!act.field)
                throw new Error("Field is required for field action");
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
        results.push({ id, actions: actionResults });
      }
      let summaryOut: any[] = [];
      let detailsOut: any[] = [];
      if (successIds.size > 0 && !actions.some((a) => a.action === "comment")) {
        const items = await workItemService.listWorkItems(
          Array.from(successIds)
        );
        if (summary) {
          summaryOut = formatWorkItemSummaryList(items);
        } else {
          detailsOut = items;
        }
      }
      return JSON.stringify({
        summary: summaryOut,
        details: detailsOut,
        results,
      });
    },
  });

  server.addTool({
    name: "bulkCreateWorkItems",
    description:
      "Bulk create Epics, Features, User Stories, and Tasks (and more) with arbitrary fields and parent/child relationships. Supports both new and existing parents.",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      epics: z
        .array(
          z.object({
            id: z.number().optional(),
            title: z.string().optional(),
            fields: z.record(z.any()).optional(),
            features: z
              .array(
                z.object({
                  id: z.number().optional(),
                  title: z.string().optional(),
                  fields: z.record(z.any()).optional(),
                  user_stories: z
                    .array(
                      z.object({
                        id: z.number().optional(),
                        title: z.string().optional(),
                        fields: z.record(z.any()).optional(),
                        tasks: z
                          .array(
                            z.object({
                              id: z.number().optional(),
                              title: z.string().optional(),
                              fields: z.record(z.any()).optional(),
                            })
                          )
                          .optional(),
                      })
                    )
                    .optional(),
                })
              )
              .optional(),
          })
        )
        .optional(),
    }),
    async execute(args) {
      const results = await workItemService.bulkCreateWorkItems(args);
      return JSON.stringify(formatBulkCreateResult(results));
    },
  });

  server.addTool({
    name: "listAllWorkItems",
    description:
      "List all work items in a project using the area path filter. Optionally filter by one or more work item types. This avoids WIQL case-sensitivity issues and is the most reliable way to get all work items in a project.",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      types: z
        .array(z.string())
        .optional()
        .describe(
          "List of work item types to filter by (e.g., ['Task', 'Bug']). Must match exactly as in Azure DevOps. Available types: Epic, Feature, User Story, Task, Bug, Issue, Code Review Request, Code Review Response, Feedback Request, Feedback Response, Shared Steps, Test Case, Test Plan, Test Suite, Shared Parameter."
        ),
      assignedTo: z
        .string()
        .optional()
        .describe(
          "Filter by assigned user. Must match the display name or unique name exactly as in Azure DevOps (e.g., 'AAS\\Ahmad.AlRowaihi' or 'Ahmad Al Rowaihi')."
        ),
      top: z
        .number()
        .optional()
        .describe("Maximum number of results to return."),
    }),
    async execute(args) {
      const { project, types, assignedTo, top } = args;
      let wiql = `SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], [System.AreaPath], [System.IterationPath] FROM WorkItems WHERE [System.AreaPath] = '${project}'`;
      if (types && types.length > 0) {
        const typeList = types
          .map((t) => `'${t.replace(/'/g, "''")}'`)
          .join(", ");
        wiql += ` AND [System.WorkItemType] IN (${typeList})`;
      }
      if (assignedTo) {
        wiql += ` AND [System.AssignedTo] = '${assignedTo.replace(
          /'/g,
          "''"
        )}'`;
      }
      const result = await workItemService.queryWorkItems(project, wiql, top);
      const items = await workItemService.getWorkItemsDetailsFromQueryResult(
        result
      );
      return JSON.stringify(formatWorkItemList(items));
    },
  });

  server.addTool({
    name: "destroyWorkItems",
    description:
      "Permanently delete (destroy) a list of work items in a project. This action is IRREVERSIBLE and cannot be undone. Accepts a project name and a list of work item IDs.",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      ids: z
        .array(z.number())
        .describe(
          "List of work item IDs to permanently delete. This action cannot be undone."
        ),
    }),
    async execute({ project, ids }) {
      const results = [];
      for (const id of ids) {
        try {
          await workItemService.deleteWorkItem(id, project);
          results.push({ id, success: true });
        } catch (error) {
          results.push({
            id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return JSON.stringify(formatDestroyWorkItemsResult(results));
    },
  });

  server.addTool({
    name: "deleteTeamIterations",
    description:
      "Delete one or more team iterations by ID. Accepts a project name, team name, and a list of iteration IDs. Returns an array of results with id, deleted (boolean), and error (optional).",
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
    name: "createTeamIteration",
    description:
      "Create a team iteration (sprint) for a project and team. Accepts project, team, name, startDate, and finishDate.",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      team: z.string().describe("The name of the team."),
      name: z.string().describe("The name of the iteration (sprint)."),
      startDate: z
        .string()
        .optional()
        .describe("Start date (YYYY-MM-DD) of the iteration."),
      finishDate: z
        .string()
        .optional()
        .describe("Finish date (YYYY-MM-DD) of the iteration."),
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
    name: "listProjectIterations",
    description:
      "List all project-level iteration nodes for a project. Returns a summary of iteration names and paths.",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
    }),
    async execute({ project }) {
      const root = await workItemService.listProjectIterations(project);
      return JSON.stringify(root);
    },
  });

  server.addTool({
    name: "updateProjectIterationDates",
    description:
      "Update the start and end dates for a project-level iteration node (affects all teams using this iteration). Usage: Provide project, iteration path (e.g. 'ProjectName\\Iteration 1'), startDate, and finishDate (YYYY-MM-DD).",
    parameters: z.object({
      project: z.string().describe("Azure DevOps project name."),
      iterationPath: z
        .string()
        .describe(
          "Project-level iteration path (e.g. 'ProjectName\\Iteration 1')."
        ),
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

  server.addTool({
    name: "getProjectIterationNodeById",
    description:
      "Fetch a project-level iteration node by its numeric ID. Returns the node's name, path, and attributes.",
    parameters: z.object({
      project: z.string().describe("The name of the Azure DevOps project."),
      id: z.number().describe("The numeric ID of the iteration node."),
    }),
    async execute({ project, id }) {
      const node = await workItemService.getProjectIterationNodeById(
        project,
        id
      );
      if (!node) return `Node not found for id ${id}`;
      return JSON.stringify({
        name: node.name,
        path: node.path,
        attributes: node.attributes,
      });
    },
  });
}
