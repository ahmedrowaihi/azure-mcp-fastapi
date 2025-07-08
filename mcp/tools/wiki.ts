import { z } from "zod";
import type { WikiService } from "@azure/services/wiki";
import type { FastMCP } from "fastmcp";

export function registerWikiTools(server: FastMCP, wikiService: WikiService) {
  server.addTool({
    name: "wiki-list",
    description: `
      List all wikis in a project.
      Optional parameters:
        - project: The Azure DevOps project name.
      Returns: Array of wikis for the project.
    `,
    parameters: z.object({ project: z.string().optional() }),
    async execute({ project }) {
      const wikis = await wikiService.listWikis(project);
      return JSON.stringify(wikis);
    },
  });

  server.addTool({
    name: "wiki-get",
    description: `
      Get details for a specific wiki by ID.
      Required parameters:
        - wikiId: The wiki ID.
      Optional parameters:
        - project: The Azure DevOps project name.
      Returns: Wiki details.
    `,
    parameters: z.object({ wikiId: z.string(), project: z.string().optional() }),
    async execute({ wikiId, project }) {
      const wiki = await wikiService.getWiki(wikiId, project);
      return JSON.stringify(wiki);
    },
  });

  server.addTool({
    name: "wiki-create",
    description: `
      Create a new wiki in a project.
      Required parameters:
        - params: Wiki creation parameters (name, projectId, etc.)
      Optional parameters:
        - project: The Azure DevOps project name.
      Returns: The created wiki.
    `,
    parameters: z.object({
      params: z.object({
        name: z.string(),
        projectId: z.string().optional(),
        repositoryId: z.string().optional(),
        mappedPath: z.string().optional(),
        type: z.number().optional(),
        version: z.any().optional(),
      }),
      project: z.string().optional(),
    }),
    async execute({ params, project }) {
      const wiki = await wikiService.createWiki(params, project);
      return JSON.stringify(wiki);
    },
  });

  server.addTool({
    name: "wiki-update",
    description: `
      Update a wiki's properties.
      Required parameters:
        - params: Wiki update parameters (name, versions, etc.)
        - wikiId: The wiki ID.
      Optional parameters:
        - project: The Azure DevOps project name.
      Returns: The updated wiki.
    `,
    parameters: z.object({
      params: z.object({
        name: z.string().optional(),
        versions: z.any().optional(),
      }),
      wikiId: z.string(),
      project: z.string().optional(),
    }),
    async execute({ params, wikiId, project }) {
      const wiki = await wikiService.updateWiki(params, wikiId, project);
      return JSON.stringify(wiki);
    },
  });

  server.addTool({
    name: "wiki-delete",
    description: `
      Delete a wiki by ID.
      Required parameters:
        - wikiId: The wiki ID.
      Optional parameters:
        - project: The Azure DevOps project name.
      Returns: Result of the delete operation.
    `,
    parameters: z.object({ wikiId: z.string(), project: z.string().optional() }),
    async execute({ wikiId, project }) {
      const result = await wikiService.deleteWiki(wikiId, project);
      return JSON.stringify(result);
    },
  });

  server.addTool({
    name: "wiki-page-list",
    description: `
      List all pages in a wiki as a flat array.
      Required parameters:
        - project: The Azure DevOps project name.
        - wikiId: The wiki ID.
      Returns: Array of all pages (WikiPageDetail) in the wiki.
    `,
    parameters: z.object({
      project: z.string(),
      wikiId: z.string(),
    }),
    async execute({ project, wikiId }) {
      const pages = await wikiService.listPages(project, wikiId);
      return JSON.stringify(pages);
    },
  });

  server.addTool({
    name: "wiki-page-get",
    description: `
      Get the content of a wiki page as text.
      Required parameters:
        - project: The Azure DevOps project name.
        - wikiId: The wiki ID.
        - path: The path to the page.
      Returns: The page content as text.
    `,
    parameters: z.object({
      project: z.string(),
      wikiId: z.string(),
      path: z.string(),
    }),
    async execute({ project, wikiId, path }) {
      const content = await wikiService.getPage(project, wikiId, path);
      return content;
    },
  });
} 