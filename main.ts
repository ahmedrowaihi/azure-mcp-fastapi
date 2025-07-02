#!/usr/bin/env node
import { createAzureConnection } from './azure';
import { provisionServices } from './azure/services';
import { createServer } from './mcp';

import type { TransportType } from './mcp/types';

if (!process.env.AZURE_ORG_URL) {
    throw new Error('AZURE_ORG_URL is not set');
}
if (!process.env.AZURE_PERSONAL_ACCESS_TOKEN) {
    throw new Error('AZURE_PERSONAL_ACCESS_TOKEN is not set');
}

const azureConnection = createAzureConnection(
    process.env.AZURE_ORG_URL!,
    process.env.AZURE_PERSONAL_ACCESS_TOKEN!,
);
const services = provisionServices(azureConnection);

let server: ReturnType<typeof createServer> | undefined;

async function main() {
    if (!server) {
        server = createServer({ services });
    }
    await server.start({ transportType: 'stdio' });
}

main();

async function gracefulShutdown() {
    await server?.stop();
    process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGQUIT', gracefulShutdown);
