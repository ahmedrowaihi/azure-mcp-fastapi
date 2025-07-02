import type {
    QueryHierarchyItem,
    WorkItem,
    WorkItemType,
} from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

export function formatWorkItemSummary(w: WorkItem): Partial<WorkItem> {
    return {
        id: w.id,
        fields: w.fields,
        url: w.url,
    };
}

export function formatWorkItemList(items: WorkItem[]): Partial<WorkItem>[] {
    return items.map((w) => ({
        id: w.id,
        fields: w.fields,
        url: w.url,
    }));
}

export function formatWorkItemTypeList(types: WorkItemType[]): Partial<WorkItemType>[] {
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
    queries: QueryHierarchyItem[],
): Partial<QueryHierarchyItem>[] {
    return queries.map((q) => ({
        id: q.id,
        name: q.name,
        path: q.path,
    }));
}
