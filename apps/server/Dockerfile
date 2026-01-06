FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS development
COPY . .
RUN pnpm install --frozen-lockfile
EXPOSE 4000
CMD ["pnpm", "--filter", "@connect-x/server", "dev"]

# Stage 2: Build for Production
FROM development AS build
RUN pnpm --filter @connect-x/shared build
RUN pnpm --filter @connect-x/server build

# Stage 3: Production Runtime
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/server/package.json ./apps/server/
COPY --from=build /app/apps/server/dist ./apps/server/dist

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]
