---
name: docker-compose-configuration
description: "Docker Compose v2 — writing and structuring docker-compose.yml files for multi-container applications. Use when: defining services, volumes, networks in compose files; setting up PostgreSQL, MySQL, Redis, Nginx, or Node.js containers; configuring health checks and depends_on; managing environment variables and .env files; using override files for dev/prod environments; orchestrating full-stack setups. DO NOT USE FOR: general Docker CLI commands (use docker-basic-commands skill); building Dockerfiles (use docker-image-building skill)."
---

# Docker Compose Skill

## Overview

This skill covers Docker Compose v2 — writing `docker-compose.yml` files, orchestrating multi-container applications, managing environments, networking, volumes, depends_on, health checks, and common workflows. Apply it when users ask about defining or running multi-container setups.

---

## 1. Basic `docker-compose.yml` Structure

```yaml
# docker-compose.yml
services:
  <service-name>:
    image: <image>:<tag> # use a pre-built image
    # OR
    build:
      context: . # build from local Dockerfile
      dockerfile: Dockerfile
    container_name: <name> # optional fixed container name
    restart: unless-stopped # always | on-failure | no
    ports:
      - "<host>:<container>"
    environment:
      KEY: value
    env_file:
      - .env
    volumes:
      - <named-volume>:<path>
      - ./<host-path>:<container-path>
    networks:
      - <network-name>
    depends_on:
      <other-service>:
        condition: service_healthy # or service_started

volumes:
  <named-volume>:

networks:
  <network-name>:
    driver: bridge
```

---

## 2. Common Service Examples

### Node.js Application

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: my-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - app-network
    depends_on:
      db:
        condition: service_healthy

networks:
  app-network:
    driver: bridge
```

### PostgreSQL Database

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: my-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

### MySQL Database

```yaml
services:
  db:
    image: mysql:8-debian
    container_name: my-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql-data:
```

### Redis Cache

```yaml
services:
  cache:
    image: redis:7-alpine
    container_name: my-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis-data:
```

### Nginx Reverse Proxy

```yaml
services:
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
```

---

## 3. Full Stack Example (App + DB + Cache + Nginx)

```yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - app-network
    depends_on:
      - app

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - app-network
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    container_name: db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    container_name: cache
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

---

## 4. Multi-Environment Setup

### Override files pattern

```
docker-compose.yml          # base (shared config)
docker-compose.override.yml # dev overrides (auto-loaded)
docker-compose.prod.yml     # production overrides
```

```bash
# Development (auto-merges docker-compose.yml + docker-compose.override.yml):
docker compose up -d

# Production:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### `docker-compose.override.yml` (development)

```yaml
services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev
```

### `docker-compose.prod.yml` (production)

```yaml
services:
  app:
    build:
      target: production
    environment:
      NODE_ENV: production
    restart: always
```

---

## 5. Key `docker compose` Commands

```bash
# Start all services (build if needed)
docker compose up -d

# Force rebuild before starting
docker compose up --build -d

# Stop and remove containers + networks
docker compose down

# Stop and remove containers + networks + volumes
docker compose down -v

# Stop and remove containers + networks + images
docker compose down --rmi all

# View status of services
docker compose ps

# Follow logs of all services
docker compose logs -f

# Follow logs of a specific service
docker compose logs -f <service>

# Execute a shell in a running service container
docker compose exec <service> /bin/sh

# Run a one-off command in a new container (removed after)
docker compose run --rm <service> <command>

# Rebuild images without starting
docker compose build
docker compose build --no-cache

# Pull latest images
docker compose pull

# Scale a service
docker compose up -d --scale app=3

# Restart a specific service
docker compose restart <service>

# Stop services without removing containers
docker compose stop

# Start previously stopped containers
docker compose start

# View the merged/resolved compose configuration
docker compose config

# Validate compose file syntax
docker compose config --quiet
```

---

## 6. Environment Variables

### `.env` file (auto-loaded by Docker Compose)

```env
DB_USER=myuser
DB_PASSWORD=secret
DB_NAME=mydb
NODE_ENV=development
APP_PORT=3000
```

### Referencing in `docker-compose.yml`

```yaml
services:
  app:
    ports:
      - "${APP_PORT}:3000"
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

### Using `env_file` for service-specific variables

```yaml
services:
  app:
    env_file:
      - .env
      - .env.local # overrides .env
```

---

## 7. Health Checks

```yaml
services:
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s # time between checks
      timeout: 5s # max time for one check
      retries: 5 # retries before marking unhealthy
      start_period: 30s # grace period after startup

  app:
    depends_on:
      db:
        condition: service_healthy # wait until db is healthy
```

---

## 8. Volumes Reference

```yaml
services:
  app:
    volumes:
      # Named volume (managed by Docker)
      - app-data:/app/data

      # Bind mount (absolute host path)
      - /host/path:/container/path

      # Bind mount (relative host path)
      - ./config:/app/config

      # Read-only bind mount
      - ./config:/app/config:ro

      # Anonymous volume (prevents overwriting node_modules in dev)
      - /app/node_modules

volumes:
  app-data: # named volume, default local driver
    driver: local

  external-data:
    external: true # pre-existing volume, not managed by compose
```

---

## 9. Networking Reference

```yaml
networks:
  app-network:
    driver: bridge # default; suitable for single-host setups

  overlay-network:
    driver: overlay # for Docker Swarm multi-host

  external-network:
    external: true # pre-existing network

services:
  app:
    networks:
      - app-network
    # Service hostname inside the network equals the service name ("app")
    # Containers on the same network resolve each other by service name
```

> Services on the same Docker Compose network communicate via their **service name** as the hostname (e.g., `db`, `cache`, `app`).

---

## 10. Best Practices

- **Never commit `.env` files** with real secrets; commit `.env.example` instead.
- **Use specific image tags** (e.g., `postgres:16-alpine`) — never `latest` in production.
- **Define `healthcheck`** on database/cache services and use `depends_on: condition: service_healthy` to prevent race conditions.
- **Use named volumes** for persistent data; bind mounts for development hot-reload.
- **Add `restart: unless-stopped`** (or `always`) for production services to survive host reboots.
- **Use override files** (`docker-compose.override.yml`) to keep development-only config separate from production.
- **Use `docker compose config`** to validate and preview the merged compose configuration.
- **Don't expose database ports** externally in production — only expose them inside the Docker network.
