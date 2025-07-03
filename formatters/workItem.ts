import type {
  QueryHierarchyItem,
  WorkItem,
  WorkItemType,
  WorkItemQueryResult,
  WorkItemStateColor,
  Comment,
  CommentList,
} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import type {
  TeamSettingsIteration,
  TeamCapacity,
  IterationWorkItems,
} from "azure-devops-node-api/interfaces/WorkInterfaces";

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

export function formatCommentList(
  comments: CommentList | null
): Partial<CommentList> | null {
  if (!comments) return null;
  return {
    comments: comments.comments?.map((c) => ({
      id: c.id,
      text: c.text,
      createdBy: c.createdBy,
      createdDate: c.createdDate,
      modifiedBy: c.modifiedBy,
      modifiedDate: c.modifiedDate,
      version: c.version,
    })),
    count: comments.count,
    totalCount: comments.totalCount,
    continuationToken: comments.continuationToken,
  };
}

export function formatComment(
  comment: Comment | null
): Partial<Comment> | null {
  if (!comment) return null;
  return {
    id: comment.id,
    text: comment.text,
    createdBy: comment.createdBy,
    createdDate: comment.createdDate,
    modifiedBy: comment.modifiedBy,
    modifiedDate: comment.modifiedDate,
    version: comment.version,
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

export function formatBulkCreateResult(results: any[]): any[] {
  if (!results) return [];
  return results.map((r) => ({
    type: r.type,
    id: r.id,
    title: r.title,
    parentType: r.parentType,
    created: r.created,
    error: r.error,
  }));
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
