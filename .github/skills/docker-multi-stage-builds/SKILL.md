---
name: docker-multi-stage-builds
description: "Docker multi-stage builds for producing small, secure production images. Use when: separating build and runtime environments in a Dockerfile; reducing final image size by discarding build tools and devDependencies; creating dev/build/test/production stages in one Dockerfile; copying only compiled artifacts into the final image; building Node.js, NestJS, Express, React, or Vue apps with multi-stage Dockerfiles. DO NOT USE FOR: writing single-stage Dockerfiles (use docker-image-building skill); managing running containers (use docker-container-management skill)."
---

# Docker Multi-Stage Builds Skill

## Overview

Multi-stage builds let you use multiple `FROM` instructions in a single Dockerfile. Each stage has its own filesystem — you can copy only the files you need from one stage into the next. This keeps the final production image lean and free of build tools, source code, and devDependencies.

---

## 1. Core Concept

```dockerfile
# Stage 1 — builder: has all build tools
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — production: only runtime, no build tools
FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist   # ← copy only compiled output
CMD ["node", "dist/main.js"]
```

Key points:

- Stages are named with `AS <name>` (optional but recommended)
- `COPY --from=<stage>` copies files from a previous stage's filesystem
- Only the **last stage** (or the `--target` stage) is the final image
- Intermediate stage layers are **not included** in the final image

---

## 2. Stage Naming & Targeting

### Name stages for clarity

```dockerfile
FROM node:20-alpine AS base
FROM base AS development
FROM base AS build
FROM node:20-alpine AS production
```

### Build only a specific stage

```bash
# Build just the development stage:
docker build --target development -t my-app:dev .

# Build just the production stage:
docker build --target production -t my-app:prod .
```

This is useful in CI to run tests in the `test` stage without building the full production image.

---

## 3. Common Stage Patterns

### Pattern: base → build → production (most common)

```dockerfile
# Shared base with dependencies cached
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Build stage — compile TypeScript / bundle
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage — minimal runtime
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Pattern: base → development + build → production (dev/prod in one file)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Development: all deps, source mounted at runtime
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build: compile for production
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production: minimal image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```bash
# Local development:
docker build --target development -t my-app:dev .

# CI / production:
docker build --target production -t my-app:prod .
```

### Pattern: with a test stage

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM base AS test
RUN npm run lint && npm run test

FROM base AS build
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
```

```bash
# CI: run tests (fails build if tests fail)
docker build --target test -t my-app:test .

# Then build production image:
docker build --target production -t my-app:prod .
```

---

## 4. NestJS Multi-Stage Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

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

## 5. React / Vue Multi-Stage Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS build
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build --target production \
  --build-arg VITE_API_URL=https://api.example.com \
  -t my-frontend:prod .
```

---

## 6. Copying Files Between Stages

### Copy from a named stage

```dockerfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
```

### Copy from an external image (not just a stage)

```dockerfile
# Copy a binary from an official image into your stage
COPY --from=golang:1.22-alpine /usr/local/go/bin/go /usr/local/bin/go
```

### Copy multiple paths

```dockerfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/config ./config
```

---

## 7. Using Docker Compose with Multi-Stage Builds

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development # use dev stage locally
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
```

```yaml
# docker-compose.prod.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production # use production stage
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
```

---

## 8. Layer Cache Optimization in Multi-Stage Builds

### Maximize cache reuse across stages with a shared `base`

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
# This layer is shared/cached for both dev and build stages:
COPY package.json package-lock.json ./

FROM base AS build
RUN npm ci          # cached unless package.json changes
COPY . .            # only this and below re-run on code changes
RUN npm run build
```

### Use BuildKit cache mounts

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build
```

### Build with cache from registry (CI optimization)

```bash
docker buildx build \
  --cache-from type=registry,ref=ghcr.io/my-org/my-app:cache \
  --cache-to   type=registry,ref=ghcr.io/my-org/my-app:cache,mode=max \
  --target production \
  -t ghcr.io/my-org/my-app:latest \
  --push .
```

---

## 9. Size Comparison

A typical Node.js app without multi-stage builds vs with:

| Approach                                              | Approximate Size |
| ----------------------------------------------------- | ---------------- |
| Single stage (node:20) — with devDeps + source        | ~600–900 MB      |
| Single stage (node:20-alpine) — with devDeps + source | ~250–400 MB      |
| Multi-stage (node:20-alpine) — prod deps + dist only  | ~80–150 MB       |
| Multi-stage (distroless) — prod deps + dist only      | ~60–120 MB       |

Check your actual image size:

```bash
docker image ls my-app --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
docker history my-app:prod
```

---

## 10. Common Mistakes

| Mistake                                 | Problem                                          | Fix                                       |
| --------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| No `AS` name on stages                  | Can't use `--target` or `COPY --from=` by name   | Always name stages: `FROM … AS <name>`    |
| Copying entire `/app` from build stage  | Copies `node_modules`, source, test files        | Copy only `dist/` or compiled output      |
| Installing all deps in production stage | Includes devDependencies                         | Use `npm ci --omit=dev`                   |
| Not using a shared `base` stage         | Package install runs twice                       | Add `base` stage, inherit from it         |
| Forgetting `.dockerignore`              | Sends `node_modules` and `.env` in build context | Always add `.dockerignore`                |
| Secrets passed via `ARG`                | Visible in `docker history`                      | Inject secrets at runtime, not build time |
