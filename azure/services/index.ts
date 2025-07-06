import { ProjectService } from "./project";
import { TeamService } from "./team";
import { WikiService } from "./wiki";
import { WorkItemService } from "./workItem";

import type { WebApi } from "azure-devops-node-api";

export const provisionServices = (azure: WebApi) => {
  return {
    projectService: new ProjectService(azure),
    workItemService: new WorkItemService(azure),
    teamService: new TeamService(azure),
    wikiService: new WikiService(azure),
  };
};
