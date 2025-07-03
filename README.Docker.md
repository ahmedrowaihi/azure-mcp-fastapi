# Azure MCP FastMCP Docker Setup

This Dockerfile creates a standalone executable for the Azure MCP (Model Context Protocol) server using Bun.

## Architecture

The Dockerfile uses a multi-stage build with 4 optimized layers:

1. **Dependencies Layer** (`deps`): Installs all Bun dependencies
2. **Build Layer** (`build`): Compiles TypeScript to JavaScript using `bun build`
3. **Executable Layer** (`executable`): Creates standalone binary using `bun build --compile`
4. **Distribution Layer** (`final`): Minimal runtime image with just the executable

## Building and running your application

When you're ready, start your application by running:

```bash
docker build -t azure-mcp-fastmcp .
docker run --rm azure-mcp-fastmcp
```

Your MCP server will communicate via stdio (standard input/output) as required by the Model Context Protocol.

## Environment Variables

The application requires the following environment variables:

- `AZURE_ORG_URL`: Your Azure DevOps organization URL
- `AZURE_PERSONAL_ACCESS_TOKEN`: Your Azure DevOps personal access token

Example with environment variables:

```bash
docker run --rm \
  -e AZURE_ORG_URL="https://dev.azure.com/your-org" \
  -e AZURE_PERSONAL_ACCESS_TOKEN="your-token" \
  azure-mcp-fastmcp
```

## Deploying your application to the cloud

First, build your image:

```bash
docker build -t azure-mcp-fastmcp .
```

If your cloud uses a different CPU architecture than your development machine (e.g., you are on a Mac M1 and your cloud provider is amd64), you'll want to build the image for that platform:

```bash
docker build --platform=linux/amd64 -t azure-mcp-fastmcp .
```

Then, push it to your registry:

```bash
docker tag azure-mcp-fastmcp your-registry.com/azure-mcp-fastmcp
docker push your-registry.com/azure-mcp-fastmcp
```

## Benefits of this approach

- **Standalone executable**: The final image contains only the compiled binary with embedded Bun runtime
- **Minimal size**: Uses Alpine Linux base for small footprint
- **Fast startup**: No dependency resolution at runtime
- **Cross-platform**: Can be built for different architectures
- **Production ready**: Optimized with minification and source maps

## References

- [Bun Documentation](https://bun.sh/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
