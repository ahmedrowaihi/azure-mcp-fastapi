import { FastMCP } from "fastmcp";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

export function registerResource(server: FastMCP) {
  server.addResource({
    name: "tools",
    description: "Tools for the Azure MCP Server",
    uri: "tools.md",
    load: async () => {
        const toolsContent = await readFile(path.join(__dirname, "tools.md"), "utf8");
        return {
            'text': toolsContent,
            'mimeType': 'text/markdown',
        }
    },
  });
}