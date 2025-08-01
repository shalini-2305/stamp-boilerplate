# Base stage for shared dependencies
FROM node:22.13.1-slim AS base
RUN apt-get update && apt-get install -y git curl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Development stage
FROM base AS development
# Configure Turbo
ENV TURBO_DAEMON=false
ENV TURBO_LOG_VERBOSITY=info
ENV TURBO_FORCE=true
ENV TURBO_UI=true

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY .env* ./

# Copy source code
COPY apps ./apps/
COPY packages ./packages/
COPY tooling ./tooling/
COPY scripts ./scripts/

# Clean install with proper workspace setup
RUN rm -rf node_modules pnpm-lock.yaml && \
    pnpm install --no-frozen-lockfile --shamefully-hoist

# Create turbo directories
RUN mkdir -p /app/.turbo && \
    chmod -R 777 /app/.turbo

# Default command
CMD ["sh", "-c", "pnpm run dev:next"]