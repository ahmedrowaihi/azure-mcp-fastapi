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
RUN bun build --compile --minify dist/main.js --outfile azure-mcp
RUN strip azure-mcp || true

################################################################################
# Layer 4: Extract and collect only needed libraries
FROM alpine:latest AS libs
RUN apk add --no-cache libstdc++ libgcc file findutils
COPY --from=executable /usr/src/app/azure-mcp /azure-mcp
RUN set -eux; \
    mkdir -p /needed-libs; \
    ldd /azure-mcp | awk '{print $3}' | grep -v '^(' | while read lib; do \
      [ -e "$lib" ] && cp -v --parents "$lib" /needed-libs/; \
      if [ -L "$lib" ]; then \
        target="$(readlink -f "$lib")"; \
        [ -e "$target" ] && cp -v --parents "$target" /needed-libs/; \
      fi; \
    done

################################################################################
# Layer 5: Distribute the executable (only required libraries)
FROM scratch AS final
COPY --from=libs /needed-libs/ /
COPY --from=executable /usr/src/app/azure-mcp /azure-mcp

# Production security labels
LABEL maintainer="ahmedrowaihi1@gmail.com"
LABEL description="Azure MCP FastMCP Server - Bun standalone executable"
LABEL version="0.0.2"

CMD ["/azure-mcp"]
