---
name: docker-environment-variables
description: "Docker environment variable management for containers and Docker Compose. Use when: passing environment variables to containers; using .env files with Docker or Docker Compose; setting default values for variables; managing secrets and sensitive values; configuring multi-environment setups (dev/staging/prod) via env files; troubleshooting missing or incorrect environment variables inside containers. DO NOT USE FOR: writing Dockerfiles from scratch (use docker-image-building skill); full production deployment setup (use docker-deployment skill); Docker secrets in Swarm mode (use docker-deployment skill)."
---

# Docker Environment Variables Skill

## Overview

This skill covers all patterns for passing, managing, and securing environment variables in Docker containers and Docker Compose services — from simple `-e` flags to `.env` files, multi-environment overrides, and security best practices.

---

## 1. Passing Variables with `docker run`

### Single variable with `-e`

```bash
docker run -e NODE_ENV=production my-app:latest
docker run -e DB_HOST=localhost -e DB_PORT=5432 my-app:latest
```

### Load from a file with `--env-file`

```bash
docker run --env-file .env my-app:latest
docker run --env-file .env.production my-app:latest
```

### Pass a host environment variable (no value = inherit from shell)

```bash
export API_KEY=abc123
docker run -e API_KEY my-app:latest   # value inherited from host shell
```

---

## 2. `.env` File Format

Docker reads `.env` files in plain `KEY=VALUE` format:

```env
# .env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=myuser
DB_PASSWORD=secret
JWT_SECRET=changeme
API_KEY=abc123

# Comments are supported
# Blank lines are ignored

# Quoted values (quotes are included literally in Docker — avoid unless needed):
APP_NAME="My Application"
```

### Rules

- No `export` keyword
- No `$()` command substitution
- Quotes are **included** as part of the value in Docker (unlike shell)
- Docker Compose strips surrounding quotes; bare `docker run --env-file` does not

---

## 3. Docker Compose Environment Variables

### Inline `environment` block

```yaml
services:
  app:
    image: my-app:latest
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: db
      DB_PORT: 5432
```

### Using `env_file`

```yaml
services:
  app:
    image: my-app:latest
    env_file:
      - .env # base variables
      - .env.local # local overrides (gitignored)
```

### Reference variables from compose-level `.env`

Docker Compose **automatically loads** a `.env` file in the same directory as the compose file. These variables are available for **variable substitution** inside the compose file itself:

```env
# .env (loaded by compose automatically)
APP_VERSION=1.0.0
DB_PASSWORD=secret
```

```yaml
services:
  app:
    image: ghcr.io/my-org/my-app:${APP_VERSION}
    environment:
      DATABASE_URL: postgres://user:${DB_PASSWORD}@db:5432/mydb
```

### Inline value + env_file combined

Values in `environment` take precedence over `env_file`:

```yaml
services:
  app:
    env_file:
      - .env
    environment:
      NODE_ENV: production # overrides NODE_ENV from .env
```

---

## 4. Default Values & Variable Substitution

Docker Compose supports shell-style default syntax in compose files:

| Syntax                  | Behavior                                            |
| ----------------------- | --------------------------------------------------- |
| `${VAR}`                | Substituted from environment or `.env`              |
| `${VAR:-default}`       | Use `default` if `VAR` is unset **or empty**        |
| `${VAR-default}`        | Use `default` only if `VAR` is unset (not if empty) |
| `${VAR:?error message}` | Fail with error if `VAR` is unset or empty          |
| `${VAR?error message}`  | Fail with error only if `VAR` is unset              |

```yaml
services:
  app:
    image: my-app:${APP_VERSION:-latest}
    environment:
      PORT: ${PORT:-3000}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      REQUIRED_KEY: ${API_KEY:?API_KEY must be set}
```

---

## 5. Multi-Environment Setup

### File structure

```
.env                    # base defaults (committed, no secrets)
.env.example            # template shown to developers (committed)
.env.local              # local developer overrides (gitignored)
.env.development        # dev-specific values (gitignored if has secrets)
.env.staging            # staging values (gitignored)
.env.production         # production values (gitignored)
```

### Load environment-specific files

```bash
# Development
docker run --env-file .env --env-file .env.development my-app:latest

# Production
docker run --env-file .env --env-file .env.production my-app:latest
```

### With Docker Compose override files

```yaml
# docker-compose.yml (base)
services:
  app:
    env_file:
      - .env
```

```yaml
# docker-compose.override.yml (dev, auto-loaded)
services:
  app:
    env_file:
      - .env
      - .env.development
    environment:
      NODE_ENV: development
```

```yaml
# docker-compose.prod.yml
services:
  app:
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
```

```bash
# Run dev (auto-merges override):
docker compose up -d

# Run prod:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 6. Viewing Environment Variables Inside a Container

```bash
# List all environment variables in a running container:
docker exec <container> env
docker exec <container> printenv

# Get a specific variable:
docker exec <container> printenv NODE_ENV

# Inspect via docker inspect (shows Env array in config):
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' <container>
```

---

## 7. Build-time vs Runtime Variables

| Type               | Declaration                        | Visible in image?       | Use for                              |
| ------------------ | ---------------------------------- | ----------------------- | ------------------------------------ |
| Build-time (`ARG`) | `ARG KEY=default` in Dockerfile    | No (not in final layer) | Build tooling, versions              |
| Runtime (`ENV`)    | `ENV KEY=value` in Dockerfile      | **Yes** (baked in)      | Application config defaults          |
| Runtime (inject)   | `-e` or `env_file` at `docker run` | No                      | Secrets, environment-specific config |

### ARG vs ENV in Dockerfile

```dockerfile
# ARG: only available during build
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

# ENV: baked into image, available at runtime
ENV NODE_ENV=production
ENV PORT=3000

# Pass ARG into ENV at build time:
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
```

```bash
docker build --build-arg APP_VERSION=1.0.0 -t my-app:1.0.0 .
```

> **Warning**: `ARG` values passed during build are visible in `docker history`. Do not pass secrets as `ARG`.

---

## 8. Security Best Practices

### Never bake secrets into images

```dockerfile
# BAD — secret stored in image layer forever
ENV DB_PASSWORD=supersecret

# BAD — visible in docker history even after unset
ARG DB_PASSWORD
ENV DB_PASSWORD=${DB_PASSWORD}

# GOOD — inject at runtime only
docker run -e DB_PASSWORD=supersecret my-app:latest
# or
docker run --env-file .env.production my-app:latest
```

### Always gitignore secret env files

```gitignore
# .gitignore
.env.local
.env.development
.env.staging
.env.production
.env.*.local
```

### Commit only `.env.example` with placeholder values

```env
# .env.example — safe to commit, shows required variables
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=
DB_PASSWORD=
JWT_SECRET=
API_KEY=
```

### Rotate secrets without rebuilding

Because secrets are injected at runtime (not baked in), update them by:

1. Updating the `.env` file on the server
2. Restarting the container: `docker compose up -d` (triggers recreate with new env)

---

## 9. Common Troubleshooting

### Variable is empty inside the container

```bash
# Check what was actually injected:
docker exec <container> printenv MY_VAR

# Verify the .env file format (no BOM, Unix line endings):
file .env
cat -A .env | head -5   # look for ^M (Windows CRLF) or strange chars
```

### Docker Compose variable substitution not working

```bash
# Preview the resolved compose file (shows substituted values):
docker compose config

# Confirm the variable is set in the shell or .env:
echo $MY_VAR
cat .env | grep MY_VAR
```

### Quotes included literally in value

```bash
# In .env:
APP_NAME="My App"

# docker run --env-file: value is literally "My App" (with quotes)
# docker compose env_file: value is My App (quotes stripped)

# Fix: don't use quotes in .env files used with docker run --env-file
APP_NAME=My App
```

### Variable precedence in Docker Compose (highest to lowest)

1. `environment` block in compose file
2. Shell environment of the user running `docker compose`
3. `.env` file in the compose file directory
4. `env_file` entries
5. Dockerfile `ENV` defaults

---

## 10. Quick Reference

| Goal                     | Command / Config             |
| ------------------------ | ---------------------------- |
| Pass single var          | `docker run -e KEY=value`    |
| Pass inherited shell var | `docker run -e KEY`          |
| Load from file           | `docker run --env-file .env` |
| Compose inline vars      | `environment: KEY: value`    |
| Compose from file        | `env_file: - .env`           |
| Default value            | `${VAR:-default}` in compose |
| Require variable         | `${VAR:?error}` in compose   |
| View vars in container   | `docker exec <c> env`        |
| Preview compose vars     | `docker compose config`      |
| Build-time var           | `ARG` in Dockerfile          |
| Runtime default (image)  | `ENV` in Dockerfile          |
