import type { WebApi } from "azure-devops-node-api";
import type { IWikiApi } from "azure-devops-node-api/WikiApi";
import type {
    WikiCreateParametersV2,
    WikiUpdateParameters,
    WikiPageDetail
} from "azure-devops-node-api/interfaces/WikiInterfaces";

export class WikiService {
  private api?: IWikiApi;
  constructor(private readonly azure: WebApi) {
    if (!azure) throw new Error("Connection is required");
  }
  private async getApi() {
    if (!this.api) {
      this.api = await this.azure.getWikiApi();
    }
    return this.api;
  }

  async listWikis(project?: string) {
    const api = await this.getApi();
    return api.getAllWikis(project);
  }

  async getWiki(wikiId: string, project?: string) {
    const api = await this.getApi();
    return api.getWiki(wikiId, project);
  }

  async createWiki(params: WikiCreateParametersV2, project?: string) {
    const api = await this.getApi();
    return api.createWiki(params, project);
  }

  async deleteWiki(wikiId: string, project?: string) {
    const api = await this.getApi();
    return api.deleteWiki(wikiId, project);
  }

  async updateWiki(params: WikiUpdateParameters, wikiId: string, project?: string) {
    const api = await this.getApi();
    return api.updateWiki(params, wikiId, project);
  }

  /**
   * Lists all pages in a wiki as a flat array using getPagesBatch.
   * @param project The Azure DevOps project name.
   * @param wikiId The wiki ID.
   * @returns Array of all WikiPageDetail objects in the wiki.
   */
  async listPages(project: string, wikiId: string): Promise<WikiPageDetail[]> {
    const api = await this.getApi();
    let allPages: WikiPageDetail[] = [];
    let continuationToken: string | undefined = undefined;
    do {
      const batchRequest = { continuationToken };
      const paged = await api.getPagesBatch(batchRequest, project, wikiId);
      let values: WikiPageDetail[] = [];
      if (paged.values) {
        if (typeof paged.values === 'function') {
          try {
            values = Array.from((paged.values as () => Iterable<WikiPageDetail>)());
          } catch {
            values = [];
          }
        } else if (Array.isArray(paged.values)) {
          values = paged.values as unknown as WikiPageDetail[];
        } else if (typeof paged.values === 'object' && paged.values && typeof (paged.values as any)[Symbol.iterator] === 'function') {
          values = Array.from(paged.values as unknown as Iterable<WikiPageDetail>);
        }
      }
      allPages = allPages.concat(values);
      continuationToken = paged.continuationToken;
    } while (continuationToken);
    return allPages;
  }

  async getPage(project: string, wikiId: string, path: string) {
    const api = await this.getApi();
    const stream = await api.getPageText(project, wikiId, path);
    return new Promise<string>((resolve, reject) => {
      let data = "";
      stream.on("data", chunk => (data += chunk));
      stream.on("end", () => resolve(data));
      stream.on("error", reject);
    });
  }
} 