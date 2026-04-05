---
name: docker-image-building
description: "Writing Dockerfiles and building Docker images for Node.js, NestJS, Express, React, Vue, and general applications. Use when: creating or improving a Dockerfile; writing multi-stage builds; reducing image size; setting up build arguments and labels; configuring .dockerignore; troubleshooting build failures; optimizing layer caching; choosing a base image. DO NOT USE FOR: running or managing containers (use docker-container-management skill); writing docker-compose.yml (use docker-compose skill); deploying to production (use docker-deployment skill)."
---

# Docker Image Building Skill

## Overview

This skill covers writing production-quality Dockerfiles, choosing the right base images, optimizing build cache and image size, and using multi-stage builds for Node.js, NestJS, Express, React, and Vue applications.

---

## 1. Dockerfile Instructions Reference

| Instruction   | Purpose                                                           |
| ------------- | ----------------------------------------------------------------- |
| `FROM`        | Set base image                                                    |
| `WORKDIR`     | Set working directory (creates if missing)                        |
| `COPY`        | Copy files from build context into image                          |
| `ADD`         | Like COPY but also handles URLs and tar extraction (prefer COPY)  |
| `RUN`         | Execute a command during build (creates a new layer)              |
| `ENV`         | Set runtime environment variable (baked into image)               |
| `ARG`         | Define a build-time variable (not available at runtime)           |
| `EXPOSE`      | Document which port the container listens on (informational only) |
| `CMD`         | Default command when container starts (overridable)               |
| `ENTRYPOINT`  | Fixed executable; CMD becomes its arguments                       |
| `USER`        | Switch to a non-root user                                         |
| `LABEL`       | Add metadata key-value pairs                                      |
| `HEALTHCHECK` | Define a health check command                                     |
| `VOLUME`      | Declare a mount point (creates anonymous volume)                  |
| `ONBUILD`     | Trigger instruction for downstream images                         |

---

## 2. Base Image Selection

### Prefer minimal, versioned base images

```dockerfile
# Node.js — Alpine (smallest, ~5 MB)
FROM node:20-alpine

# Node.js — Debian slim (better compatibility, ~80 MB)
FROM node:20-slim

# Node.js — full Debian (maximum compatibility, ~300 MB)
FROM node:20-bookworm

# Distroless (no shell, most secure for production)
FROM gcr.io/distroless/nodejs20-debian12
```

### Rules

- **Always pin a specific version** (`node:20-alpine`, not `node:latest` or `node:alpine`)
- **Use Alpine** for small, well-understood images with standard dependencies
- **Use Debian slim** when native modules (e.g., `bcrypt`, `canvas`) require glibc
- **Use distroless** for production when you want the smallest attack surface (no shell, no package manager)

---

## 3. Node.js / Express Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
# Copy only package files first for better cache utilization
COPY package.json package-lock.json ./

# --- Development stage ---
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Build stage (for compiled/transpiled apps) ---
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## 4. NestJS Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# --- Build stage ---
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
```

---

## 5. React / Vue Frontend Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production: serve with Nginx ---
FROM nginx:alpine AS production
# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx config for SPA (`nginx/nginx.conf`)**:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## 6. `.dockerignore`

Always create a `.dockerignore` to exclude unnecessary files from the build context. This reduces build time and prevents accidentally including secrets.

```dockerignore
# Dependencies
node_modules
npm-debug.log
yarn-debug.log
yarn-error.log

# Build outputs
dist
build
.next
.nuxt
out

# Environment files with secrets
.env
.env.*
!.env.example

# Version control
.git
.gitignore

# Editor / OS
.vscode
.idea
.DS_Store
Thumbs.db

# Docker files (not needed in context)
Dockerfile*
docker-compose*
.dockerignore

# Test / CI
coverage
.nyc_output
*.test.ts
*.spec.ts
__tests__

# Documentation
README.md
CHANGELOG.md
docs
```

---

## 7. Build Arguments (`ARG`)

Use `ARG` for values needed only at build time (e.g., versions, build flags):

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

ARG APP_VERSION=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
```

```bash
docker build \
  --build-arg APP_VERSION=1.2.0 \
  --build-arg BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  -t my-app:1.2.0 .
```

> **Warning**: `ARG` values are visible in `docker history`. Never pass secrets as `ARG`.

---

## 8. Layer Caching Best Practices

### Copy dependency files before source code

```dockerfile
# GOOD: package files change less often than source code
COPY package.json package-lock.json ./
RUN npm ci
COPY . .          # source code change only invalidates from here

# BAD: every source change invalidates npm ci
COPY . .
RUN npm ci
```

### Chain RUN commands to reduce layers

```dockerfile
# BAD: 3 layers
RUN apk update
RUN apk add --no-cache curl
RUN rm -rf /var/cache/apk/*

# GOOD: 1 layer
RUN apk update && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*
```

### Use BuildKit cache mounts for package managers

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

```bash
# Enable BuildKit:
DOCKER_BUILDKIT=1 docker build .
# or (Docker 23+, BuildKit is default):
docker build .
```

---

## 9. Image Labels (OCI Standard)

```dockerfile
LABEL org.opencontainers.image.title="My App"
LABEL org.opencontainers.image.description="Production API server"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="team@example.com"
LABEL org.opencontainers.image.url="https://github.com/my-org/my-app"
LABEL org.opencontainers.image.source="https://github.com/my-org/my-app"
LABEL org.opencontainers.image.created="2024-01-01T00:00:00Z"
LABEL org.opencontainers.image.revision="abc1234"
```

---

## 10. Security Hardening

### Run as non-root user

```dockerfile
# Alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Debian/Ubuntu
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser
USER appuser
```

### Use read-only filesystem at runtime

```bash
docker run --read-only --tmpfs /tmp my-app:latest
```

### Avoid installing unnecessary tools in production

```dockerfile
# BAD in production stage
RUN apk add --no-cache curl vim bash git

# GOOD: only what the app needs to run
RUN apk add --no-cache dumb-init
```

### Use `dumb-init` as PID 1 to handle signals correctly

```dockerfile
RUN apk add --no-cache dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

---

## 11. Building & Tagging

```bash
# Build with a tag
docker build -t my-app:latest .

# Build with multiple tags
docker build -t my-app:1.0.0 -t my-app:latest .

# Build a specific stage
docker build --target development -t my-app:dev .
docker build --target production -t my-app:prod .

# Build with a specific Dockerfile
docker build -f Dockerfile.prod -t my-app:prod .

# Build with no cache (force fresh build)
docker build --no-cache -t my-app:latest .

# Build for multiple platforms (requires buildx)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t my-app:latest \
  --push .
```

---

## 12. Inspecting Images

```bash
# List images
docker images
docker image ls

# Show image layers and history
docker history my-app:latest
docker history --no-trunc my-app:latest

# Inspect full image metadata
docker inspect my-app:latest

# Check image size
docker image ls --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Analyse image layers with dive (third-party tool)
dive my-app:latest
```

---

## 13. Common Dockerfile Anti-patterns

| Anti-pattern                            | Problem                                        | Fix                          |
| --------------------------------------- | ---------------------------------------------- | ---------------------------- |
| `FROM node:latest`                      | Unpredictable base, breaks on updates          | `FROM node:20-alpine`        |
| Copying everything before `npm install` | Cache miss on every code change                | Copy `package*.json` first   |
| `RUN npm install` in production         | Installs devDependencies, large image          | `RUN npm ci --omit=dev`      |
| Not cleaning caches                     | Bloated image                                  | `&& npm cache clean --force` |
| Running as root                         | Security risk                                  | `USER appuser`               |
| Secrets in `ENV` or `ARG`               | Baked into image layers                        | Inject at runtime only       |
| One giant `COPY . .`                    | Over-copies, breaks `.dockerignore` purpose    | Use explicit COPY paths      |
| No `.dockerignore`                      | Sends `node_modules`, `.git`, `.env` to daemon | Add `.dockerignore`          |
