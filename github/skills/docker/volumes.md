---
name: docker-volumes
description: "Docker volume management for persistent data storage. Use when: creating and managing named volumes; using bind mounts for development hot-reload; configuring tmpfs mounts; persisting database data (PostgreSQL, MySQL, MongoDB, Redis); sharing data between containers; backing up and restoring volume data; understanding volume drivers; configuring volumes in Docker Compose. DO NOT USE FOR: networking between containers (use docker-networking skill); writing docker-compose.yml from scratch (use docker-compose skill); production deployment strategy (use docker-deployment skill)."
---

# Docker Volumes Skill

## Overview

This skill covers all Docker storage types — named volumes, bind mounts, and tmpfs mounts — including CLI management, Docker Compose configuration, backup and restore patterns, and best practices for persistent data in production.

---

## 1. Storage Types Overview

| Type                 | Description                                          | Use Case                                    |
| -------------------- | ---------------------------------------------------- | ------------------------------------------- |
| **Named volume**     | Managed by Docker; stored in Docker's data directory | Production databases, persistent app data   |
| **Bind mount**       | Maps a host path directly into a container           | Development hot-reload, config injection    |
| **tmpfs mount**      | In-memory only; lost when container stops            | Secrets, temporary scratch data, test state |
| **Anonymous volume** | Like named volume but Docker assigns the name        | Short-lived; avoid in production            |

---

## 2. Named Volumes

### Create a named volume

```bash
docker volume create my-data
```

### List volumes

```bash
docker volume ls
docker volume ls --filter name=my-data
```

### Inspect a volume

```bash
docker volume inspect my-data
# Shows: mountpoint, driver, labels, creation date
```

### Remove a volume

```bash
docker volume rm my-data

# Remove all unused volumes (not referenced by any container):
docker volume prune
docker volume prune -f   # skip confirmation
```

### Mount a named volume when running a container

```bash
docker run -d \
  --name my-db \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

---

## 3. Bind Mounts

### Mount a host directory

```bash
# Absolute path required
docker run -d \
  --name my-app \
  -v /Users/me/projects/my-app:/app \
  my-app:latest

# Current directory (shorthand):
docker run -d -v $(pwd):/app my-app:latest
```

### Read-only bind mount

```bash
docker run -d \
  -v $(pwd)/config:/app/config:ro \
  my-app:latest
```

### Prevent overwriting node_modules (anonymous volume trick)

```bash
# The anonymous volume on /app/node_modules takes precedence,
# so the host bind-mount doesn't wipe out the container's node_modules:
docker run -d \
  -v $(pwd):/app \
  -v /app/node_modules \
  my-app:dev
```

---

## 4. tmpfs Mounts

```bash
# In-memory mount; data is lost when the container stops:
docker run -d \
  --tmpfs /tmp \
  --tmpfs /app/cache:size=100m,mode=1777 \
  my-app:latest
```

Useful for:

- Temporary files that should never be written to disk (security)
- High-speed scratch storage for tests
- Secrets that must not persist

---

## 5. Volume Mount Syntax

Docker supports two syntax styles:

### Short syntax (`-v` / `volumes:`)

```
[source:]target[:options]
```

| Example                   | Type                                     |
| ------------------------- | ---------------------------------------- |
| `-v my-data:/app/data`    | Named volume                             |
| `-v /host/path:/app/data` | Bind mount (absolute path)               |
| `-v ./relative:/app/data` | Bind mount (relative path, Compose only) |
| `-v /app/data`            | Anonymous volume                         |
| `-v my-data:/app/data:ro` | Named volume, read-only                  |

### Long syntax (`--mount`)

```bash
docker run --mount type=volume,source=my-data,target=/app/data my-app:latest
docker run --mount type=bind,source=$(pwd),target=/app my-app:latest
docker run --mount type=tmpfs,target=/tmp,tmpfs-size=100m my-app:latest
```

The `--mount` syntax is more explicit and preferred in scripts.

---

## 6. Volumes in Docker Compose

### Named volume (recommended for databases)

```yaml
services:
  db:
    image: postgres:16-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data: # named volume, managed by Docker
```

### Bind mount for development hot-reload

```yaml
services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app # bind mount source code
      - /app/node_modules # anonymous volume: keep container's node_modules
```

### Read-only config injection

```yaml
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
```

### tmpfs mount in Compose

```yaml
services:
  app:
    tmpfs:
      - /tmp
      - /app/cache
```

### Full volume configuration reference

```yaml
volumes:
  postgres-data:
    driver: local # default driver
    driver_opts:
      type: none
      o: bind
      device: /mnt/ssd/postgres # bind mount via volume driver (Linux)

  nfs-share:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/exports/shared"

  external-vol:
    external: true # pre-existing volume, not managed by compose
    name: my-existing-volume # optional: use a different name on the host
```

---

## 7. Common Data Paths by Service

| Service             | Data Path in Container          |
| ------------------- | ------------------------------- |
| PostgreSQL          | `/var/lib/postgresql/data`      |
| MySQL / MariaDB     | `/var/lib/mysql`                |
| MongoDB             | `/data/db`                      |
| Redis               | `/data`                         |
| Elasticsearch       | `/usr/share/elasticsearch/data` |
| Nginx (logs)        | `/var/log/nginx`                |
| Node.js app uploads | `/app/uploads` (app-defined)    |

---

## 8. Sharing Data Between Containers

### Shared named volume

```yaml
services:
  uploader:
    image: my-uploader:latest
    volumes:
      - shared-uploads:/app/uploads

  processor:
    image: my-processor:latest
    volumes:
      - shared-uploads:/data/input:ro # read-only for processor

volumes:
  shared-uploads:
```

### `volumes_from` (inherit all volumes from another container)

```yaml
services:
  sidecar:
    image: my-sidecar:latest
    volumes_from:
      - app:ro # inherit all volumes from "app" service, read-only
```

---

## 9. Backup & Restore

### Backup a named volume to a tar file

```bash
docker run --rm \
  -v my-data:/data:ro \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/my-data-backup.tar.gz -C /data .
```

### Restore from a tar file into a named volume

```bash
docker run --rm \
  -v my-data:/data \
  -v $(pwd):/backup \
  alpine \
  sh -c "cd /data && tar xzf /backup/my-data-backup.tar.gz"
```

### Backup a PostgreSQL database (preferred over volume backup)

```bash
docker exec my-db pg_dump -U myuser mydb > backup.sql
docker exec my-db pg_dumpall -U myuser > all-databases.sql
```

### Restore PostgreSQL from SQL dump

```bash
docker exec -i my-db psql -U myuser mydb < backup.sql
```

### Copy volume data between hosts (via SSH)

```bash
# On source machine — pipe to SSH:
docker run --rm \
  -v my-data:/data:ro \
  alpine tar czf - -C /data . | \
  ssh user@remote-host "docker run --rm -i \
    -v my-data:/data \
    alpine sh -c 'cd /data && tar xzf -'"
```

---

## 10. Volume Lifecycle with Compose

```bash
# Start services (volumes created if missing):
docker compose up -d

# Stop services but keep containers and volumes:
docker compose stop

# Remove containers and networks; volumes are KEPT:
docker compose down

# Remove containers, networks, AND named volumes (DESTRUCTIVE):
docker compose down -v

# Remove a specific volume:
docker volume rm <project>_postgres-data
```

> **Warning**: `docker compose down -v` permanently deletes all named volumes declared in the compose file. Always back up data before running this in production.

---

## 11. Volume Drivers

### Local driver (default)

```yaml
volumes:
  my-data:
    driver: local
```

### NFS volume

```yaml
volumes:
  nfs-data:
    driver: local
    driver_opts:
      type: nfs
      o: "addr=192.168.1.100,rw,nfsvers=4"
      device: ":/exports/mydata"
```

### Third-party volume plugins

```bash
# Install a plugin (example: rexray for cloud storage):
docker plugin install rexray/s3fs \
  S3FS_ACCESSKEY=<key> \
  S3FS_SECRETKEY=<secret>

# Create volume using plugin:
docker volume create --driver rexray/s3fs my-s3-volume
```

---

## 12. Troubleshooting

### Permission denied errors

```bash
# Check volume mount point ownership:
docker run --rm -v my-data:/data alpine ls -la /data

# Fix ownership (match container's user UID/GID):
docker run --rm -v my-data:/data alpine chown -R 1000:1000 /data

# Or set user in compose:
services:
  app:
    user: "1000:1000"
```

### Data not persisting after container restart

```bash
# Verify the correct volume is mounted:
docker inspect my-container | jq '.[0].Mounts'

# Confirm named volume (not anonymous) is used:
docker volume ls
```

### Volume is not empty on first start (PostgreSQL init skipped)

PostgreSQL only runs init scripts when the data directory is empty. If a volume already has data, init scripts are skipped. To reinitialize:

```bash
docker compose down -v    # removes volume
docker compose up -d      # fresh init
```

### Find which containers use a volume

```bash
docker ps -a --filter volume=my-data
```

### Check disk usage of volumes

```bash
docker system df -v
docker system df -v | grep my-data
```

---

## 13. Best Practices

- **Use named volumes for databases** — never bind mounts; they are portable and Docker-managed
- **Use bind mounts for development only** — source code, config files that change frequently
- **Never store secrets in volumes** — use environment variables or Docker secrets instead
- **Set `:ro` on config/cert volumes** — prevent accidental writes from within the container
- **Back up before `down -v`** — `docker compose down -v` is irreversible
- **Use `external: true`** in compose for volumes that must persist across `docker compose down`
- **Match UID/GID** between host user and container user for bind mounts to avoid permission issues
- **Label volumes** for easier management in production:
  ```yaml
  volumes:
    postgres-data:
      labels:
        com.example.env: production
        com.example.service: database
  ```

---

## 14. Quick Reference

| Goal                       | Command / Config                                         |
| -------------------------- | -------------------------------------------------------- |
| Create named volume        | `docker volume create my-data`                           |
| List volumes               | `docker volume ls`                                       |
| Inspect volume             | `docker volume inspect my-data`                          |
| Remove volume              | `docker volume rm my-data`                               |
| Remove unused volumes      | `docker volume prune`                                    |
| Mount named volume         | `-v my-data:/container/path`                             |
| Bind mount (dev)           | `-v $(pwd):/app`                                         |
| Read-only mount            | `-v my-data:/path:ro`                                    |
| tmpfs mount                | `--tmpfs /tmp`                                           |
| Backup volume              | `docker run --rm -v my-data:/data:ro alpine tar czf ...` |
| Check mounts               | `docker inspect <c> \| jq '.[0].Mounts'`                 |
| Disk usage                 | `docker system df -v`                                    |
| Compose down (keep data)   | `docker compose down`                                    |
| Compose down (delete data) | `docker compose down -v` ⚠️                              |
