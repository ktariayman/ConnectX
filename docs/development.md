# Development Guide

## Local Development (Recommended)

For the best development experience, run the project locally without Docker:

```bash
# Install dependencies
pnpm install

# Start all services in watch mode
pnpm dev
```

This gives you:
- ✅ Instant hot-reload
- ✅ Native performance
- ✅ Full IDE integration
- ✅ Easy debugging

**Ports:**
- Client: http://localhost:5173
- Server: http://localhost:4000

## Docker Development

Docker is primarily for production builds and CI/CD. If you need to test the containerized version:

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up --build
```

## Why Not Docker for Development?

pnpm monorepos with symlinks don't play well with Docker volumes on Windows. The selective mounting required becomes complex and fragile. Local development is faster and more reliable.

this is only for windows users, for mac and linux users, you can use docker for development