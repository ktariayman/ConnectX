FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS development
# Copy only files needed for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/

RUN pnpm install --frozen-lockfile

# Final source copy (will be overwritten by volume in compose)
COPY . .
CMD ["pnpm", "--filter", "@connect-x/client", "dev", "--host"]

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @connect-x/shared build
RUN pnpm --filter @connect-x/client build

FROM nginx:stable-alpine AS production
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
