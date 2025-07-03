# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG BUN_VERSION=canary
################################################################################
# Use bun image for base image for all stages.
FROM oven/bun:${BUN_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Layer 1: Install all dependencies (production + dev)
FROM base AS deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.bun to speed up subsequent builds.
# Leverage bind mounts to package.json and bun.lock to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=bun.lock,target=bun.lock \
    --mount=type=cache,target=/root/.bun \
    bun install

################################################################################
# Layer 2: Build the application (produces dist/main.js)
FROM deps AS build

# Copy the rest of the source files into the image.
COPY . .

# Build the application using bun run build
RUN bun build main.ts --target bun --outdir dist --minify

################################################################################
# Layer 3: Create standalone executable from dist/main.js
FROM build AS executable

# Create standalone executable from the built version
RUN bun build --compile --minify --sourcemap dist/main.js --outfile azure-mcp
RUN chmod +x azure-mcp

################################################################################
# Layer 4: Distribute the executable
FROM oven/bun:${BUN_VERSION}-alpine AS final

# Copy the standalone executable from the executable stage
COPY --from=executable /usr/src/app/azure-mcp /usr/src/app/azure-mcp

# Run the standalone executable
CMD ["/usr/src/app/azure-mcp"]
