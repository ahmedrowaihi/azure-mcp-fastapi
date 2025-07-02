import type { PolicyConfiguration } from 'azure-devops-node-api/interfaces/PolicyInterfaces';

export function formatPolicyList(policies: PolicyConfiguration[]): Partial<PolicyConfiguration>[] {
    return policies.map((p) => ({
        id: p.id,
        type: p.type,
        isEnabled: p.isEnabled,
        isDeleted: p.isDeleted,
        createdBy: p.createdBy,
        createdDate: p.createdDate,
        isBlocking: p.isBlocking,
        settings: p.settings,
    }));
}

export function formatPolicyDetails(p: PolicyConfiguration): Partial<PolicyConfiguration> {
    return {
        id: p.id,
        type: p.type,
        isEnabled: p.isEnabled,
        isDeleted: p.isDeleted,
        createdBy: p.createdBy,
        createdDate: p.createdDate,
        isBlocking: p.isBlocking,
        settings: p.settings,
    };
}
