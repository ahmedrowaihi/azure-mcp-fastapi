#!/usr/bin/env node
import type { WebApi } from "azure-devops-node-api";
import { createAzureConnection } from "./azure";
import { provisionServices } from "./azure/services";
import { createServer } from "./mcp";

let azureConnection: WebApi;
if (!!process.env.AZURE_ORG_URL && !!process.env.AZURE_PERSONAL_ACCESS_TOKEN) {
  azureConnection = createAzureConnection(
    process.env.AZURE_ORG_URL!,
    process.env.AZURE_PERSONAL_ACCESS_TOKEN!
  );
} else {
  console.warn("AZURE_ORG_URL and AZURE_PERSONAL_ACCESS_TOKEN must be set");
  azureConnection = {} as WebApi;
}

const services = provisionServices(azureConnection);

let server: ReturnType<typeof createServer> | undefined;

async function main() {
  if (!server) {
    server = createServer({ services });
  }
  await server.start({ transportType: "stdio" });
}

main();

async function gracefulShutdown() {
  await server?.stop();
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGQUIT", gracefulShutdown);
