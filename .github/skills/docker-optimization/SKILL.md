---
name: docker-optimization
description: "Docker image and container performance optimization. Use when: reducing Docker image size; speeding up docker build times; optimizing layer caching; improving container startup time; reducing memory and CPU usage of containers; optimizing build context; using BuildKit features; profiling and analyzing image layers; tuning resource limits; improving CI/CD pipeline build speed with Docker. DO NOT USE FOR: writing Dockerfiles from scratch (use docker-image-building skill); multi-stage builds introduction (use docker-multi-stage-builds skill); production deployment strategy (use docker-deployment skill)."
---

# Docker Optimization Skill

## Overview

This skill covers techniques to reduce Docker image size, speed up build times, minimize resource consumption, and improve overall container performance. Apply it when a Dockerfile or build pipeline is slow, images are too large, or containers consume excessive resources.

---

## 1. Image Size Optimization

### Use the smallest viable base image

```dockerfile
# Largest → Smallest:
FROM node:20                  # ~1 GB
FROM node:20-bookworm-slim    # ~230 MB
FROM node:20-alpine           # ~50 MB
FROM gcr.io/distroless/nodejs20-debian12  # ~40 MB (no shell, most secure)

# For static binaries or compiled languages:
FROM scratch                  # 0 MB — empty filesystem
```

### Install only what you need and clean up in the same layer

```dockerfile
# BAD: cleanup in a separate layer doesn't reduce size
RUN apk add --no-cache curl git
RUN rm -rf /var/cache/apk/*

# GOOD: single layer, no cache stored
RUN apk add --no-cache curl git

# For apt (Debian/Ubuntu):
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl git && \
    rm -rf /var/lib/apt/lists/*
```

### Install only production dependencies

```dockerfile
# Node.js — exclude devDependencies
RUN npm ci --omit=dev && npm cache clean --force

# Yarn
RUN yarn install --production && yarn cache clean

# pnpm
RUN pnpm install --prod
```

### Remove unnecessary files after build steps

```dockerfile
RUN npm run build && \
    rm -rf src tests .eslintrc* tsconfig*.json jest.config.*
```

---

## 2. Layer Caching Optimization

### Order instructions from least to most frequently changed

```dockerfile
# GOOD: stable layers first
FROM node:20-alpine
WORKDIR /app

# 1. System dependencies (rarely change)
RUN apk add --no-cache dumb-init

# 2. Package manifests (change less often than source)
COPY package.json package-lock.json ./
RUN npm ci

# 3. Source code (changes most often — last)
COPY . .
RUN npm run build
```

### Split package installs if you have multiple manifests

```dockerfile
# Monorepo example — copy only the root manifest first
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
RUN npm ci
COPY . .
```

### Use a shared `base` stage in multi-stage builds

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
# This layer is shared/reused by both dev and build stages:
RUN npm ci

FROM base AS build
COPY . .
RUN npm run build

FROM base AS development
CMD ["npm", "run", "dev"]
```

---

## 3. BuildKit Features

Enable BuildKit (default in Docker 23+, otherwise set env var):

```bash
DOCKER_BUILDKIT=1 docker build .
```

### Use the BuildKit frontend directive

```dockerfile
# syntax=docker/dockerfile:1
```

Place this as the very first line to opt in to the latest BuildKit Dockerfile syntax.

### Cache mounts — persist package manager caches across builds

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./

# npm cache persisted across builds (not included in image)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build
```

```dockerfile
# pnpm
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
```

```dockerfile
# apt
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && apt-get install -y --no-install-recommends curl
```

### Secret mounts — pass secrets without baking them in

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci
```

```bash
docker build --secret id=npmrc,src=.npmrc .
```

### Bind mounts — use host files without COPY

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
```

---

## 4. Build Context Optimization

### Always use `.dockerignore`

The build context is sent to the Docker daemon before the build starts. A bloated context slows every build. Exclude everything not needed:

```dockerignore
node_modules
dist
build
.git
.github
.env
.env.*
!.env.example
coverage
.nyc_output
*.log
.DS_Store
.vscode
.idea
README.md
docs
docker-compose*
Dockerfile*
.dockerignore
```

### Check build context size before building

```bash
# Dry-run to see what's sent (requires tar):
tar -czh . | wc -c

# Or use docker build output verbosity:
docker build --progress=plain . 2>&1 | head -20
```

### Use a specific build context path

```bash
# Only send the src/ directory as context:
docker build -f Dockerfile src/

# Send a subdirectory:
docker build -f ./Dockerfile.api ./services/api
```

---

## 5. Multi-Stage Build Size Reduction

Copy only the compiled artifacts into the final stage — not source code, test files, or build tools:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build && npm prune --production

FROM node:20-alpine AS production
WORKDIR /app
# Copy only what the app needs to run:
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "dist/main.js"]
```

---

## 6. Container Runtime Optimization

### Set memory and CPU limits to prevent resource starvation

```bash
docker run -d \
  --memory 512m \
  --memory-swap 512m \   # equal to memory = no swap
  --cpus 1.0 \
  my-app:latest
```

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 128M
```

### Use `dumb-init` or `tini` as PID 1 for proper signal handling

```dockerfile
RUN apk add --no-cache dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

This ensures:

- Proper `SIGTERM` handling for graceful shutdown
- Zombie process reaping
- Faster container stop (no 10-second kill timeout)

### Configure Node.js memory for the container

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=450"
# Set to ~80-90% of the container memory limit
```

### Use read-only filesystem where possible

```bash
docker run --read-only --tmpfs /tmp --tmpfs /app/logs my-app:latest
```

---

## 7. Image Analysis Tools

### Built-in: `docker history`

```bash
# See each layer size:
docker history my-app:latest

# Without truncation:
docker history --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" my-app:latest
```

### Built-in: `docker image inspect`

```bash
# Check total image size and layers:
docker inspect my-app:latest | jq '.[0].RootFS.Layers | length'
docker image ls my-app --format "{{.Size}}"
```

### `dive` — interactive layer explorer (third-party)

```bash
# Install:
brew install dive        # macOS
# or
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive my-app:latest

# Run:
dive my-app:latest
# Shows layer-by-layer filesystem changes and wasted space
```

### `docker scout` — vulnerability and layer analysis (Docker Desktop)

```bash
docker scout cves my-app:latest
docker scout recommendations my-app:latest
docker scout compare my-app:1.0.0 --to my-app:2.0.0
```

---

## 8. CI/CD Build Speed Optimization

### Use registry cache (GitHub Actions)

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/my-org/my-app:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Use registry cache (generic)

```bash
docker buildx build \
  --cache-from type=registry,ref=ghcr.io/my-org/my-app:cache \
  --cache-to   type=registry,ref=ghcr.io/my-org/my-app:cache,mode=max \
  -t ghcr.io/my-org/my-app:latest \
  --push .
```

### Use `--target` to only build needed stages in CI

```bash
# Run tests without building the production image:
docker build --target test -t my-app:test .
docker run --rm my-app:test

# Then build production only if tests pass:
docker build --target production -t my-app:prod .
```

### Use `docker buildx bake` for parallel builds

```hcl
# docker-bake.hcl
group "default" {
  targets = ["app", "worker"]
}

target "app" {
  context    = "."
  dockerfile = "Dockerfile"
  target     = "production"
  tags       = ["ghcr.io/my-org/app:latest"]
}

target "worker" {
  context    = "./worker"
  dockerfile = "Dockerfile"
  tags       = ["ghcr.io/my-org/worker:latest"]
}
```

```bash
docker buildx bake --push
```

---

## 9. Logging Optimization

Prevent log files from filling disk in production:

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m" # rotate after 10 MB
        max-file: "3" # keep 3 rotated files max
```

For high-volume services, use a dedicated logging driver:

```yaml
logging:
  driver: "fluentd"
  options:
    fluentd-address: "localhost:24224"
    tag: "my-app"
```

---

## 10. Optimization Checklist

### Image size

- [ ] Using minimal base image (`alpine` or `slim` variant)
- [ ] Multi-stage build — only artifacts in final stage
- [ ] `npm ci --omit=dev` (no devDependencies in production image)
- [ ] `npm cache clean --force` after install
- [ ] `.dockerignore` excludes `node_modules`, `.git`, `.env`, build outputs
- [ ] No unnecessary tools or files installed in production stage

### Build speed

- [ ] Package manifests copied before source code (layer cache)
- [ ] BuildKit enabled (default in Docker 23+)
- [ ] `--mount=type=cache` used for package manager cache
- [ ] Registry or GHA cache configured in CI pipeline
- [ ] Build context is small (check with `tar -czh . | wc -c`)

### Runtime performance

- [ ] Memory and CPU limits set (`--memory`, `--cpus`)
- [ ] `NODE_OPTIONS=--max-old-space-size` tuned to container limit
- [ ] `dumb-init` or `tini` used as PID 1
- [ ] Log rotation configured (`max-size`, `max-file`)
- [ ] Running as non-root user (`USER appuser`)
- [ ] Health check defined for graceful orchestration

---

## 11. Quick Reference

| Optimization      | Technique                                |
| ----------------- | ---------------------------------------- |
| Smaller base      | `node:20-alpine` over `node:20`          |
| No devDeps        | `npm ci --omit=dev`                      |
| Layer cache       | Copy `package*.json` before source       |
| Build cache       | `--mount=type=cache,target=/root/.npm`   |
| Small context     | Add comprehensive `.dockerignore`        |
| Small final image | Multi-stage: copy only `dist/`           |
| Signal handling   | `dumb-init` as PID 1                     |
| Memory tuning     | `NODE_OPTIONS=--max-old-space-size=<MB>` |
| Resource limits   | `--memory 512m --cpus 1.0`               |
| Log rotation      | `max-size: 10m`, `max-file: 3`           |
| Analyze layers    | `docker history` or `dive`               |
| CI cache          | `cache-from/cache-to: type=gha`          |
