import { formatPolicyList, formatPolicyDetails } from '@formatters/policy';
import { z } from 'zod';

import type { PolicyService } from '@azure/services/policy';
import type { FastMCP } from 'fastmcp';

export function registerPolicyTools(server: FastMCP, policyService: PolicyService) {
    server.addTool({
        name: 'listPolicies',
        description: 'List policies for a project or repo',
        parameters: z.object({ project: z.string(), repoId: z.string().optional() }),
        async execute(args) {
            const { project, repoId } = args;
            const policies = await policyService.listPolicies(project, repoId);
            return JSON.stringify(formatPolicyList(policies));
        },
    });
    server.addTool({
        name: 'getPolicyDetails',
        description: 'Get policy details by configuration ID',
        parameters: z.object({ project: z.string(), configurationId: z.number() }),
        async execute(args) {
            const { project, configurationId } = args;
            const p = await policyService.getPolicyDetails(project, configurationId);
            return JSON.stringify(formatPolicyDetails(p));
        },
    });
}
