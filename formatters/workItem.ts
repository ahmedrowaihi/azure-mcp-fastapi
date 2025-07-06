import type {
  IterationWorkItems,
  TeamCapacity,
  TeamSettingsIteration,
} from "azure-devops-node-api/interfaces/WorkInterfaces";
import type {
  QueryHierarchyItem,
  WorkItem,
  WorkItemQueryResult,
  WorkItemStateColor,
  WorkItemType
} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

export function formatWorkItemSummary(w: WorkItem): Partial<WorkItem> {
  return {
    id: w.id,
    fields: w.fields,
    url: w.url,
  };
}

export function formatWorkItemList(
  items: WorkItem[] | null
): Partial<WorkItem>[] {
  if (!items) return [];
  return items.map((w) => ({
    id: w.id,
    fields: w.fields,
    url: w.url,
  }));
}

export function formatWorkItemTypeList(
  types: WorkItemType[] | null
): Partial<WorkItemType>[] {
  if (!types) return [];
  return types.map((t) => ({
    name: t.name,
    description: t.description,
    color: t.color,
    referenceName: t.referenceName,
    states: t.states,
    transitions: t.transitions,
    isDisabled: t.isDisabled,
  }));
}

export function formatWorkItemType(
  workItemType: WorkItemType | null
): Partial<WorkItemType> | null {
  if (!workItemType) return null;
  return {
    name: workItemType.name,
    description: workItemType.description,
    fields: workItemType.fields?.map((f) => ({
      name: f.name,
      referenceName: f.referenceName,
      description: f.helpText,
      required: f.alwaysRequired,
      allowedValues: f.allowedValues,
    })),
  };
}

export function formatWorkItemQueryList(
  queries: QueryHierarchyItem[] | null
): Partial<QueryHierarchyItem>[] {
  if (!queries) return [];
  return queries.map((q) => ({
    id: q.id,
    name: q.name,
    path: q.path,
  }));
}

export function formatWorkItemQueryResult(
  result: WorkItemQueryResult | null
): Partial<WorkItemQueryResult> | null {
  if (!result) return null;
  return {
    workItems: result.workItems?.map((wi) => ({
      id: wi.id,
      url: wi.url,
    })),
    asOf: result.asOf,
    columns: result.columns,
    queryType: result.queryType,
    sortColumns: result.sortColumns,
    workItemRelations: result.workItemRelations,
  };
}

export function formatWorkItemStates(
  states: WorkItemStateColor[] | null
): Partial<WorkItemStateColor>[] {
  if (!states) return [];
  return states.map((s) => ({
    name: s.name,
    color: s.color,
    category: s.category,
  }));
}

export function formatTeamIterations(
  iterations: TeamSettingsIteration[] | null
): Partial<TeamSettingsIteration>[] {
  if (!iterations) return [];
  return iterations.map((i) => ({
    id: i.id,
    name: i.name,
    path: i.path,
    attributes: i.attributes,
    url: i.url,
  }));
}

export function formatTeamCapacity(
  capacity: TeamCapacity | null
): Partial<TeamCapacity> | null {
  if (!capacity) return null;
  return {
    teamMembers: capacity.teamMembers?.map((tm) => ({
      teamMember: tm.teamMember,
      activities: tm.activities,
      daysOff: tm.daysOff,
      url: tm.url,
    })),
    totalCapacityPerDay: capacity.totalCapacityPerDay,
    totalDaysOff: capacity.totalDaysOff,
  };
}

export function formatIterationWorkItems(
  result: IterationWorkItems | null
): Partial<IterationWorkItems> | null {
  if (!result) return null;
  return {
    workItemRelations: result.workItemRelations,
    url: result.url,
  };
}

export function formatWorkItemLinkResult(
  w: WorkItem | null
): Partial<WorkItem> | null {
  if (!w) return null;
  return {
    id: w.id,
    url: w.url,
    relations: w.relations?.map((r) => ({
      rel: r.rel,
      url: r.url,
      attributes: r.attributes,
    })),
  };
}

export function formatWorkItemSummaryList(items: any[]): any[] {
  if (!items) return [];
  return items.map((w) => ({
    id: w.id,
    title: w.fields?.["System.Title"],
    type: w.fields?.["System.WorkItemType"],
    state: w.fields?.["System.State"],
    assignedTo:
      w.fields?.["System.AssignedTo"]?.displayName ||
      w.fields?.["System.AssignedTo"],
    storyPoints: w.fields?.["Microsoft.VSTS.Scheduling.StoryPoints"],
  }));
}

export function formatBulkCreateResult(results: any[]): any {
  if (!results) return { summary: { total: 0, created: 0, linked: 0, failed: 0, errors: [] }, results: [] };
  
  const summary = {
    total: results.length,
    created: results.filter((r: any) => r.created && !r.error).length,
    linked: results.filter((r: any) => !r.created && !r.error).length,
    failed: results.filter((r: any) => r.error).length,
    errors: results.filter((r: any) => r.error).map((r: any) => ({
      type: r.type,
      title: r.title,
      error: r.error
    }))
  };
  
  return {
    summary,
    results: results.map((r: any) => ({
      type: r.type,
      id: r.id,
      title: r.title,
      parentType: r.parentType,
      created: r.created,
      error: r.error,
      url: r.url
    }))
  };
}

export function formatBulkUpdateResult(results: any[]): any {
  if (!results) return { summary: { totalWorkItems: 0, totalActions: 0, successfulWorkItems: 0, failedWorkItems: 0, successfulActions: 0, failedActions: 0 }, results: [] };
  
  const summary = {
    totalWorkItems: results.length,
    totalActions: results.reduce((sum: number, r: any) => sum + r.actions.length, 0),
    successfulWorkItems: results.filter((r: any) => r.actions.every((a: any) => a.success)).length,
    failedWorkItems: results.filter((r: any) => r.actions.some((a: any) => !a.success)).length,
    successfulActions: results.reduce((sum: number, r: any) => sum + r.actions.filter((a: any) => a.success).length, 0),
    failedActions: results.reduce((sum: number, r: any) => sum + r.actions.filter((a: any) => !a.success).length, 0)
  };
  
  return {
    summary,
    results: results.map((r: any) => ({
      id: r.id,
      actions: r.actions.map((a: any) => ({
        action: a.action,
        field: a.field,
        success: a.success,
        error: a.error
      }))
    }))
  };
}

export function formatDestroyWorkItemsResult(
  results: { id: number; success: boolean; error?: string }[]
): { id: number; destroyed: boolean; error?: string }[] {
  return results.map((r) => ({
    id: r.id,
    destroyed: !!r.success,
    ...(r.success ? {} : { error: r.error }),
  }));
}
