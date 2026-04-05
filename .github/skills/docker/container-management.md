---
name: docker-container-management
description: "Docker container lifecycle management. Use when: creating, starting, stopping, restarting, pausing, or removing containers; inspecting container state, logs, resource stats, processes; copying files to/from containers; executing commands inside running containers; attaching to container output; renaming or committing containers; managing container restarts policies; troubleshooting container crashes or exits. DO NOT USE FOR: building images (use docker-image-building skill); writing docker-compose.yml (use docker-compose skill); networking or volume management (use docker-networking or docker-volumes skills)."
---

# Docker Container Management Skill

## Overview

This skill covers the full lifecycle of Docker containers — from creation and startup to monitoring, debugging, and removal. Apply it when users need to manage, inspect, or troubleshoot individual containers.

---

## 1. Creating & Running Containers

### Run a container (most common flags)

```bash
docker run [OPTIONS] <image>:<tag> [COMMAND]

# Key options:
#   -d, --detach          Run in background
#   -it                   Interactive + pseudo-TTY (for shells)
#   --name <name>         Assign a fixed name
#   -p <host>:<container> Publish a port
#   -e KEY=VALUE          Set an environment variable
#   --env-file <file>     Load variables from a file
#   -v <vol>:<path>       Mount a volume or bind mount
#   --network <network>   Connect to a Docker network
#   --rm                  Auto-remove after container exits
#   --restart <policy>    Restart policy (see section 5)
#   -u <user>             Run as a specific user
#   -w <dir>              Set working directory inside container
#   --memory <limit>      Memory limit (e.g., 512m, 1g)
#   --cpus <count>        CPU limit (e.g., 0.5, 2)

# Examples:
docker run -d --name my-app -p 3000:3000 --rm my-app:latest
docker run -it --rm ubuntu:22.04 bash
docker run -d --name db -e POSTGRES_PASSWORD=secret postgres:16-alpine
```

### Create a container without starting it

```bash
docker create --name my-container my-app:latest
```

### Start a created or stopped container

```bash
docker start <container>
docker start -a <container>   # attach to stdout/stderr after starting
```

---

## 2. Listing Containers

```bash
# Running containers only
docker ps

# All containers (running + stopped + exited)
docker ps -a

# Show only container IDs (useful for scripting)
docker ps -q
docker ps -aq

# Filter by status
docker ps --filter "status=exited"
docker ps --filter "status=running"
docker ps --filter "name=my-app"

# Custom format output
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 3. Stopping & Removing Containers

### Stop (graceful SIGTERM, then SIGKILL after timeout)

```bash
docker stop <container>
docker stop -t 30 <container>   # 30-second timeout before SIGKILL
```

### Kill immediately (SIGKILL)

```bash
docker kill <container>
docker kill --signal SIGTERM <container>
```

### Pause / Unpause (freeze without stopping)

```bash
docker pause <container>
docker unpause <container>
```

### Restart

```bash
docker restart <container>
docker restart -t 10 <container>   # 10-second grace period
```

### Remove a container

```bash
docker rm <container>
docker rm -f <container>           # force-remove even if running
docker rm -v <container>           # also remove associated anonymous volumes
```

### Remove all stopped containers

```bash
docker container prune
docker container prune -f          # skip confirmation prompt
```

### Stop and remove all running containers (use with caution)

```bash
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
```

---

## 4. Inspecting & Monitoring Containers

### View container logs

```bash
docker logs <container>
docker logs -f <container>               # follow (live tail)
docker logs --tail 100 <container>       # last 100 lines
docker logs --since 10m <container>      # logs from last 10 minutes
docker logs --since 2024-01-01 <container>
docker logs -f --tail 50 <container>     # follow from last 50 lines
```

### Inspect full container metadata (JSON)

```bash
docker inspect <container>

# Extract a specific field with Go template:
docker inspect --format '{{.State.Status}}' <container>
docker inspect --format '{{.NetworkSettings.IPAddress}}' <container>
docker inspect --format '{{.HostConfig.RestartPolicy.Name}}' <container>
```

### Real-time resource usage stats

```bash
docker stats                          # all running containers
docker stats <container>              # single container
docker stats --no-stream <container>  # one-time snapshot (no live update)
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### List running processes inside a container

```bash
docker top <container>
docker top <container> aux            # pass options to ps
```

### View port mappings

```bash
docker port <container>
docker port <container> 3000          # specific container port
```

### View filesystem changes since container started

```bash
docker diff <container>
# A = added, C = changed, D = deleted
```

---

## 5. Executing Commands Inside Containers

### Open an interactive shell

```bash
docker exec -it <container> /bin/sh    # for Alpine/minimal images
docker exec -it <container> bash       # for Debian/Ubuntu images
```

### Run a one-off command (non-interactive)

```bash
docker exec <container> <command>
docker exec <container> env            # list environment variables
docker exec <container> cat /etc/hosts
```

### Run as a specific user

```bash
docker exec -u root -it <container> bash
docker exec -u 1000 <container> whoami
```

### Set environment variables for exec

```bash
docker exec -e MY_VAR=value <container> <command>
```

### Attach to a running container's main process output

```bash
docker attach <container>
# Detach without stopping: Ctrl+P, Ctrl+Q
```

---

## 6. Copying Files

### From container to host

```bash
docker cp <container>:<src-path> <dest-path>
# Example:
docker cp my-app:/app/logs/error.log ./error.log
```

### From host to container

```bash
docker cp <src-path> <container>:<dest-path>
# Example:
docker cp ./config.json my-app:/app/config.json
```

---

## 7. Restart Policies

Set with `--restart` flag on `docker run` or in `docker-compose.yml`:

| Policy           | Behavior                                           |
| ---------------- | -------------------------------------------------- |
| `no`             | Never restart (default)                            |
| `always`         | Always restart, including on Docker daemon startup |
| `unless-stopped` | Restart always except when manually stopped        |
| `on-failure`     | Restart only on non-zero exit code                 |
| `on-failure:3`   | Restart on failure, max 3 retries                  |

```bash
docker run -d --restart unless-stopped my-app:latest
docker run -d --restart on-failure:3 my-worker:latest
```

Update restart policy on an existing container:

```bash
docker update --restart unless-stopped <container>
```

---

## 8. Renaming & Committing Containers

### Rename a container

```bash
docker rename <old-name> <new-name>
```

### Commit a container's state to a new image

```bash
docker commit <container> <new-image>:<tag>
docker commit -m "Added config files" my-container my-image:v2
```

---

## 9. Resource Limits

Apply at `docker run` time or update a running container:

```bash
# Set limits at run time:
docker run -d --memory 512m --cpus 1.0 my-app:latest

# Update limits on a running container:
docker update --memory 1g --cpus 2.0 <container>
docker update --memory-swap 2g <container>
```

---

## 10. Common Troubleshooting Patterns

### Container exits immediately

```bash
# Check exit code and logs:
docker ps -a --filter "name=<container>"
docker logs <container>
docker inspect --format '{{.State.ExitCode}}' <container>
docker inspect --format '{{.State.Error}}' <container>
```

### Check why a container is unhealthy

```bash
docker inspect --format '{{json .State.Health}}' <container> | jq
```

### Debug a crashed container (run a new one from same image with shell)

```bash
docker run -it --rm --entrypoint /bin/sh <image>:<tag>
```

### View container environment variables

```bash
docker exec <container> env
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' <container>
```

### Check which ports are bound

```bash
docker port <container>
```

---

## 11. Quick Reference Table

| Action            | Command                                      |
| ----------------- | -------------------------------------------- |
| Run (detached)    | `docker run -d --name <n> -p <h>:<c> <img>`  |
| Run interactively | `docker run -it --rm <img> /bin/sh`          |
| List running      | `docker ps`                                  |
| List all          | `docker ps -a`                               |
| Stop              | `docker stop <container>`                    |
| Restart           | `docker restart <container>`                 |
| Remove            | `docker rm <container>`                      |
| Force remove      | `docker rm -f <container>`                   |
| Remove stopped    | `docker container prune`                     |
| Follow logs       | `docker logs -f <container>`                 |
| Shell into        | `docker exec -it <container> /bin/sh`        |
| Run command       | `docker exec <container> <cmd>`              |
| Copy to host      | `docker cp <container>:<src> <dest>`         |
| Copy to container | `docker cp <src> <container>:<dest>`         |
| Resource stats    | `docker stats <container>`                   |
| Inspect           | `docker inspect <container>`                 |
| Top processes     | `docker top <container>`                     |
| Port mappings     | `docker port <container>`                    |
| Update restart    | `docker update --restart unless-stopped <c>` |
