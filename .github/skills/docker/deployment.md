---
name: docker-deployment
description: "Docker-based application deployment strategies and workflows. Use when: deploying containerized applications to production; setting up CI/CD pipelines with Docker; building and pushing images to registries (Docker Hub, GHCR, ECR, GCR); deploying with docker compose in production; rolling updates and zero-downtime deployments; deploying to VPS or cloud VMs with Docker; configuring environment-specific setups for staging and production. DO NOT USE FOR: Kubernetes deployments (use k8s skills); writing Dockerfiles from scratch (use docker-image-building skill); local development setup (use docker-compose skill)."
---

# Docker Deployment Skill

## Overview

This skill covers deploying containerized applications to production environments using Docker and Docker Compose. It includes image registry workflows, CI/CD integration, production compose configurations, zero-downtime strategies, and deployment checklists.

---

## 1. Image Registry Workflow

### Build and tag for a registry

```bash
# Convention: <registry>/<namespace>/<image>:<tag>
docker build -t ghcr.io/my-org/my-app:1.0.0 .
docker build -t ghcr.io/my-org/my-app:latest .

# Tag an existing local image:
docker tag my-app:latest ghcr.io/my-org/my-app:1.0.0
```

### Login to registries

```bash
# Docker Hub
docker login

# GitHub Container Registry (GHCR)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Google Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Push an image

```bash
docker push ghcr.io/my-org/my-app:1.0.0
docker push ghcr.io/my-org/my-app:latest
```

### Pull an image on the deployment target

```bash
docker pull ghcr.io/my-org/my-app:1.0.0
```

---

## 2. Production `docker-compose.yml`

### Recommended production compose file

```yaml
# docker-compose.prod.yml
services:
  app:
    image: ghcr.io/my-org/my-app:${APP_VERSION:-latest}
    container_name: my-app
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000" # bind to localhost only; Nginx proxies externally
    env_file:
      - .env.prod
    networks:
      - app-network
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M

  db:
    image: postgres:16-alpine
    container_name: my-db
    restart: unless-stopped
    env_file:
      - .env.prod
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: my-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - app-network
    depends_on:
      - app
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### Use a base + override pattern for environments

```
docker-compose.yml          # shared base config
docker-compose.prod.yml     # production overrides (images, restart, logging)
docker-compose.staging.yml  # staging overrides
docker-compose.override.yml # local dev overrides (auto-loaded)
```

```bash
# Deploy to production:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Deploy to staging:
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

---

## 3. Deployment Workflow on a VPS / Cloud VM

### Initial server setup (one-time)

```bash
# Install Docker Engine (Debian/Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Create deployment directory
mkdir -p /opt/my-app && cd /opt/my-app
```

### Deploy / update application

```bash
# 1. Pull the latest image from registry
docker pull ghcr.io/my-org/my-app:1.0.0

# 2. Update APP_VERSION in .env or pass inline
export APP_VERSION=1.0.0

# 3. Re-create affected containers only (minimal downtime)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-build

# 4. Verify containers are healthy
docker compose ps
docker compose logs -f app --tail 50
```

### Full redeploy with rebuild

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 4. Zero-Downtime / Rolling Deployment

Docker Compose (without Swarm) does not natively support rolling updates, but zero-downtime can be achieved with the following patterns:

### Pattern A — Blue/Green with a single host

```bash
# Start new container alongside old one on a different port
docker run -d --name my-app-green -p 3001:3000 ghcr.io/my-org/my-app:1.0.0

# Test the new container
curl http://localhost:3001/health

# Update Nginx upstream to point to new container, then reload Nginx
docker exec my-nginx nginx -s reload

# Stop and remove old container
docker stop my-app-blue && docker rm my-app-blue

# Rename for next cycle
docker rename my-app-green my-app-blue
```

### Pattern B — `--scale` with a load balancer

```bash
# Scale up new replicas (requires a load balancer in front)
docker compose up -d --scale app=2 --no-recreate

# Verify both replicas are healthy, then scale old one down
docker compose up -d --scale app=1
```

### Pattern C — Docker Swarm rolling update

```bash
docker service update \
  --image ghcr.io/my-org/my-app:1.0.0 \
  --update-parallelism 1 \
  --update-delay 10s \
  my-stack_app
```

---

## 5. CI/CD Pipeline Integration

### GitHub Actions — Build, push, and deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image-tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/my-app
            export APP_VERSION=${{ needs.build-and-push.outputs.image-tag }}
            docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            docker image prune -f
```

### GitLab CI — Build and deploy

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

variables:
  IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

build:
  stage: build
  image: docker:26
  services:
    - docker:26-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE .
    - docker push $IMAGE
    - docker tag $IMAGE $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "
      cd /opt/my-app &&
      export APP_VERSION=$CI_COMMIT_SHA &&
      docker compose -f docker-compose.yml -f docker-compose.prod.yml pull &&
      docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d &&
      docker image prune -f"
  only:
    - main
```

---

## 6. Environment & Secrets Management

### `.env.prod` file (on the server, never committed)

```env
APP_VERSION=1.0.0
NODE_ENV=production
DB_USER=myuser
DB_PASSWORD=supersecret
DB_NAME=mydb
DB_HOST=db
JWT_SECRET=changeme
```

### Use Docker secrets (Swarm mode)

```bash
# Create a secret
echo "supersecret" | docker secret create db_password -

# Reference in compose (Swarm only):
services:
  app:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

### Never do these in production

```bash
# BAD: secret in image layer
ENV DB_PASSWORD=secret

# BAD: secret visible in docker history
docker build --build-arg DB_PASSWORD=secret .

# GOOD: pass via env_file or runtime environment only
docker run --env-file .env.prod my-app:latest
```

---

## 7. Health Checks & Readiness

### Add health check to compose service

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s # grace period for startup
```

### Check health status after deploy

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
docker inspect --format '{{.State.Health.Status}}' my-app
```

### Wait for healthy status in a deploy script

```bash
until [ "$(docker inspect --format '{{.State.Health.Status}}' my-app)" = "healthy" ]; do
  echo "Waiting for app to be healthy..."
  sleep 5
done
echo "App is healthy!"
```

---

## 8. Rollback

```bash
# Rollback to a previous image tag
export APP_VERSION=0.9.0
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or pull a specific SHA
docker pull ghcr.io/my-org/my-app:abc1234
APP_VERSION=abc1234 docker compose up -d
```

Keep the last 2–3 image versions available in the registry to enable quick rollbacks.

---

## 9. Post-Deployment Cleanup

```bash
# Remove unused images (keep tagged versions)
docker image prune -f

# Remove stopped containers
docker container prune -f

# Remove all unused resources (volumes excluded)
docker system prune -f

# Full cleanup including volumes (CAUTION: deletes data volumes)
docker system prune -a --volumes -f
```

---

## 10. Production Deployment Checklist

- [ ] Image is tagged with a specific version (not just `latest`) for traceability
- [ ] Image pushed to and pulled from a private registry with auth
- [ ] Environment variables and secrets are passed at runtime, not baked into the image
- [ ] `restart: unless-stopped` (or `always`) set on all production services
- [ ] `healthcheck` defined for the app and database services
- [ ] Database volume is a named volume persisted outside container lifecycle
- [ ] Logs are configured with `max-size` and `max-file` to prevent disk exhaustion
- [ ] Ports are bound to `127.0.0.1` for services fronted by Nginx (not `0.0.0.0`)
- [ ] Nginx or reverse proxy terminates TLS and proxies to the app internally
- [ ] Rollback procedure tested and previous image version is available
- [ ] `docker image prune` run after deploy to free disk space
- [ ] CI/CD pipeline runs tests before deploying to production
