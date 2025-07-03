import { PolicyService } from "./policy";
import { ProjectService } from "./project";
import { TeamService } from "./team";
import { WorkItemService } from "./workItem";
import { ProfileService } from "./profile";

import type { WebApi } from "azure-devops-node-api";

export const provisionServices = (azure: WebApi) => {
  return {
    projectService: new ProjectService(azure),
    workItemService: new WorkItemService(azure),
    teamService: new TeamService(azure),
    policyService: new PolicyService(azure),
    profileService: new ProfileService(azure),
  };
};
