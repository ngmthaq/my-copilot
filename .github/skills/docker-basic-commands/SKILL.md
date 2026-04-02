---
name: docker-basic-commands
description: "Docker CLI and Docker Compose essential commands. Use when: running containers, pulling or building images, managing volumes or networks, viewing logs, executing shells in containers, cleaning up Docker resources, starting or stopping services with docker compose, rebuilding images, scaling services. DO NOT USE FOR: writing Dockerfiles or docker-compose.yml from scratch (use docker-image-building or docker-compose skills)."
---

# Docker Basic Commands Skill

## Overview

This skill covers fundamental Docker CLI commands and Docker Compose workflows. Apply it when users ask about running containers, managing images, networking, volumes, or orchestrating multi-container applications with Docker Compose.

---

## 1. Docker Images

### Pull an image

```bash
docker pull <image>:<tag>
# Example:
docker pull node:20-alpine
```

### List local images

```bash
docker images
docker image ls
```

### Build an image from a Dockerfile

```bash
docker build -t <name>:<tag> <context>
# Example:
docker build -t my-app:latest .
```

### Build with a specific Dockerfile

```bash
docker build -f Dockerfile.prod -t my-app:prod .
```

### Remove an image

```bash
docker rmi <image>:<tag>
docker image rm <image-id>
```

### Remove all dangling images

```bash
docker image prune
# Including all unused images:
docker image prune -a
```

### Tag an image

```bash
docker tag <source-image>:<tag> <target-image>:<tag>
```

### Push an image to a registry

```bash
docker push <registry>/<image>:<tag>
```

---

## 2. Docker Containers

### Run a container

```bash
docker run <image>
# Common flags:
#   -d              run in detached (background) mode
#   -it             interactive with pseudo-TTY
#   --name          assign a name
#   -p host:container  publish a port
#   -e KEY=VALUE    set environment variable
#   -v host:container  bind mount a volume
#   --rm            remove container when it exits
#   --network       connect to a network

# Example:
docker run -d --name my-app -p 3000:3000 --rm my-app:latest
```

### List containers

```bash
docker ps          # running containers
docker ps -a       # all containers (including stopped)
```

### Stop / start / restart a container

```bash
docker stop <container>
docker start <container>
docker restart <container>
```

### Remove a container

```bash
docker rm <container>
docker rm -f <container>   # force-remove a running container
```

### Remove all stopped containers

```bash
docker container prune
```

### View container logs

```bash
docker logs <container>
docker logs -f <container>      # follow (tail)
docker logs --tail 100 <container>
```

### Execute a command inside a running container

```bash
docker exec -it <container> /bin/sh
docker exec -it <container> bash
docker exec <container> <command>
```

### Inspect container details

```bash
docker inspect <container>
```

### Copy files between host and container

```bash
docker cp <container>:<src-path> <dest-path>
docker cp <src-path> <container>:<dest-path>
```

### View resource usage

```bash
docker stats
docker stats <container>
```

---

## 3. Docker Volumes

### Create a named volume

```bash
docker volume create <volume-name>
```

### List volumes

```bash
docker volume ls
```

### Inspect a volume

```bash
docker volume inspect <volume-name>
```

### Remove a volume

```bash
docker volume rm <volume-name>
docker volume prune   # remove all unused volumes
```

### Mount a volume when running a container

```bash
# Named volume:
docker run -v my-data:/app/data my-app:latest

# Bind mount (host path):
docker run -v /host/path:/container/path my-app:latest

# Read-only bind mount:
docker run -v /host/path:/container/path:ro my-app:latest
```

---

## 4. Docker Networks

### List networks

```bash
docker network ls
```

### Create a network

```bash
docker network create my-network
docker network create --driver bridge my-network
```

### Connect a container to a network

```bash
docker network connect my-network <container>
```

### Disconnect a container from a network

```bash
docker network disconnect my-network <container>
```

### Run a container on a specific network

```bash
docker run --network my-network my-app:latest
```

### Inspect a network

```bash
docker network inspect my-network
```

### Remove a network

```bash
docker network rm my-network
docker network prune   # remove all unused networks
```

---

## 5. Docker System Maintenance

### Show disk usage

```bash
docker system df
```

### Remove all unused resources (images, containers, volumes, networks)

```bash
docker system prune
docker system prune -a --volumes   # aggressive cleanup (use with caution)
```

### Show Docker info / version

```bash
docker info
docker version
```

---

## 6. Docker Compose (Included)

> Use `docker compose` (v2 plugin) instead of the legacy `docker-compose` command.

### Start services (build if needed)

```bash
docker compose up
docker compose up -d                  # detached
docker compose up --build             # force rebuild images
docker compose up --build -d          # rebuild and detach
```

### Stop services

```bash
docker compose down                   # stop and remove containers/networks
docker compose down -v                # also remove named volumes
docker compose down --rmi all         # also remove images built by compose
```

### View running services

```bash
docker compose ps
```

### View logs

```bash
docker compose logs
docker compose logs -f                # follow
docker compose logs -f <service>      # follow specific service
```

### Execute a command in a running service container

```bash
docker compose exec <service> /bin/sh
docker compose exec <service> bash
```

### Run a one-off command in a new container

```bash
docker compose run --rm <service> <command>
```

### Build images without starting containers

```bash
docker compose build
docker compose build --no-cache       # ignore build cache
```

### Pull latest images for all services

```bash
docker compose pull
```

### Scale a service

```bash
docker compose up -d --scale <service>=3
```

### Restart a specific service

```bash
docker compose restart <service>
```

### Stop without removing containers

```bash
docker compose stop
docker compose stop <service>
```

### Start previously stopped containers

```bash
docker compose start
docker compose start <service>
```

### View configure resolved compose file

```bash
docker compose config
```

---

## 7. Common Patterns & Best Practices

- **Always use specific image tags** (`node:20-alpine`) instead of `latest` in production to ensure reproducibility.
- **Use `--rm`** for short-lived containers to avoid accumulation of stopped containers.
- **Use named volumes** for persistent data; use bind mounts for development hot-reload.
- **Use `.dockerignore`** to exclude `node_modules`, `.git`, build outputs from the build context.
- **Never embed secrets** in images or Dockerfiles; pass via environment variables or Docker secrets.
- **Prefer `docker compose up --build`** during development to ensure the latest code is reflected.
- **Use `docker compose down -v`** with caution — it deletes named volumes and their data.
- **Health checks**: define `healthcheck` in `docker-compose.yml` so dependent services wait properly.

---

## 8. Quick Reference Table

| Action                     | Command                                     |
| -------------------------- | ------------------------------------------- |
| Run container (detached)   | `docker run -d --name <n> -p <h>:<c> <img>` |
| View running containers    | `docker ps`                                 |
| View logs                  | `docker logs -f <container>`                |
| Shell into container       | `docker exec -it <container> /bin/sh`       |
| Stop container             | `docker stop <container>`                   |
| Remove container           | `docker rm <container>`                     |
| Remove image               | `docker rmi <image>`                        |
| Clean everything           | `docker system prune -a --volumes`          |
| Compose up (rebuild)       | `docker compose up --build -d`              |
| Compose down (+volumes)    | `docker compose down -v`                    |
| Compose logs (follow)      | `docker compose logs -f`                    |
| Compose shell into service | `docker compose exec <svc> /bin/sh`         |
