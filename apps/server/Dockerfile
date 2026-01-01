FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS development
# Copy only files needed for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

RUN pnpm install --frozen-lockfile

# Final source copy (will be overwritten by volume in compose)
COPY . .
CMD ["pnpm", "--filter", "@connect-x/server", "dev"]

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @connect-x/shared build
RUN pnpm --filter @connect-x/server build

FROM node:20-slim AS production
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/server/package.json ./apps/server/
COPY --from=build /app/apps/server/dist ./apps/server/dist

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]
