---
name: docker-networking
description: "Docker network management and container communication. Use when: creating and managing Docker networks; connecting containers to networks; understanding bridge, host, overlay, and none network drivers; configuring service-to-service communication in Docker Compose; exposing and binding container ports; troubleshooting container connectivity issues; setting up DNS resolution between containers; isolating containers with custom networks. DO NOT USE FOR: writing docker-compose.yml from scratch (use docker-compose skill); production deployment setup (use docker-deployment skill); volume management (use docker-volumes skill)."
---

# Docker Networking Skill

## Overview

This skill covers Docker networking concepts, drivers, CLI management, container-to-container communication, port publishing, DNS resolution, and troubleshooting connectivity problems.

---

## 1. Network Drivers Overview

| Driver    | Use Case                                           | Scope |
| --------- | -------------------------------------------------- | ----- |
| `bridge`  | Default for single-host container communication    | Local |
| `host`    | Container shares host network stack (no isolation) | Local |
| `none`    | No network access (fully isolated)                 | Local |
| `overlay` | Multi-host networking (Docker Swarm)               | Swarm |
| `macvlan` | Assign a real MAC address to containers            | Local |
| `ipvlan`  | Like macvlan but shares MAC; Layer 2/3 modes       | Local |

### When to use each driver

- **`bridge`** — default for most single-host setups; use custom bridge networks (not the default `bridge`) for container name resolution
- **`host`** — for maximum network performance; removes network isolation (Linux only)
- **`none`** — for containers that need no network access at all (e.g., batch jobs)
- **`overlay`** — for Docker Swarm multi-host deployments
- **`macvlan`** — when containers need to appear as physical devices on the network

---

## 2. Managing Networks

### List networks

```bash
docker network ls
docker network ls --filter driver=bridge
```

### Create a network

```bash
# Default bridge driver
docker network create my-network

# Explicitly specify driver
docker network create --driver bridge my-network

# Custom subnet and gateway
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  my-network
```

### Inspect a network

```bash
docker network inspect my-network

# Show connected containers and their IPs:
docker network inspect my-network \
  --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}'
```

### Remove a network

```bash
docker network rm my-network

# Remove all unused networks:
docker network prune
docker network prune -f   # skip confirmation
```

---

## 3. Connecting Containers to Networks

### Connect at run time

```bash
docker run -d --name my-app --network my-network my-app:latest
```

### Connect a running container

```bash
docker network connect my-network my-app
```

### Connect with a specific IP or alias

```bash
docker network connect --ip 172.20.0.10 my-network my-app
docker network connect --alias api my-network my-app
```

### Disconnect a container

```bash
docker network disconnect my-network my-app
```

### Connect a container to multiple networks

```bash
docker run -d --name my-app --network frontend-network my-app:latest
docker network connect backend-network my-app
```

---

## 4. Port Publishing

### Publish a port at run time

```bash
# Map host port 8080 → container port 3000
docker run -p 8080:3000 my-app:latest

# Bind to a specific host interface (security best practice)
docker run -p 127.0.0.1:8080:3000 my-app:latest

# Map UDP port
docker run -p 5353:5353/udp my-app:latest

# Publish all EXPOSE'd ports to random host ports
docker run -P my-app:latest

# Check published ports
docker port my-app
```

### In Docker Compose

```yaml
services:
  app:
    ports:
      - "3000:3000" # all interfaces
      - "127.0.0.1:3000:3000" # localhost only (recommended for internal services)
      - "0.0.0.0:3000:3000" # explicit all interfaces
      - "3000" # random host port → container 3000
```

> **Security**: Bind internal services (databases, caches) to `127.0.0.1` so they are only accessible through a reverse proxy, not directly exposed.

---

## 5. Container DNS & Name Resolution

### Custom bridge networks provide automatic DNS

Containers on a **user-defined bridge network** can resolve each other by **service name** or **container name**:

```bash
docker network create my-network

docker run -d --name db --network my-network postgres:16-alpine
docker run -d --name app --network my-network my-app:latest

# Inside "app", you can reach "db" by hostname:
# postgres://db:5432/mydb
```

> The **default `bridge` network** does NOT support DNS resolution by name — you must use custom networks.

### Network aliases

```bash
# Multiple containers sharing one alias (load balancing):
docker run -d --name app1 --network my-network \
  --network-alias api my-app:latest

docker run -d --name app2 --network my-network \
  --network-alias api my-app:latest

# Any container resolves "api" to one of app1 or app2
```

### In Docker Compose — service name is the hostname

```yaml
services:
  app:
    environment:
      # "db" resolves to the db service container on the same network
      DATABASE_URL: postgres://user:pass@db:5432/mydb
      REDIS_URL: redis://cache:6379

  db:
    image: postgres:16-alpine

  cache:
    image: redis:7-alpine
```

---

## 6. Network Isolation Patterns

### Isolate frontend from database with multiple networks

```yaml
services:
  nginx:
    networks:
      - frontend

  app:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend # db is NOT on frontend network

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

- `nginx` → `app`: allowed (both on `frontend`)
- `app` → `db`: allowed (both on `backend`)
- `nginx` → `db`: **blocked** (different networks)

### Run a container with no network access

```bash
docker run --network none my-job:latest
```

---

## 7. Host Network Mode

```bash
# Container uses host's network stack directly (no port mapping needed)
docker run --network host my-app:latest

# In Docker Compose:
services:
  app:
    network_mode: host
```

> **Linux only**: On macOS and Windows, `host` mode does not bypass the VM layer — use it only on Linux hosts.
> **Security**: Removes network isolation entirely. Use only when performance is critical and isolation is not required.

---

## 8. External / Pre-existing Networks

```yaml
# docker-compose.yml
networks:
  shared-network:
    external: true # must already exist before compose up
```

```bash
# Create the external network before running compose:
docker network create shared-network

docker compose up -d
```

Use external networks to share a network between multiple Compose projects.

---

## 9. Network in Docker Compose — Full Reference

```yaml
services:
  app:
    networks:
      app-network:
        aliases:
          - api # reachable as "api" on this network
        ipv4_address: 172.20.0.10 # static IP (requires subnet config)

networks:
  app-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: my-bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
    labels:
      com.example.env: production
```

---

## 10. Troubleshooting Connectivity

### Check if two containers can communicate

```bash
# Ping by container name (only works on custom networks):
docker exec my-app ping -c 3 db

# Check DNS resolution:
docker exec my-app nslookup db
docker exec my-app nslookup cache

# Test TCP connectivity on a port:
docker exec my-app nc -zv db 5432
docker exec my-app wget -qO- http://api:3000/health
```

### Check which networks a container is connected to

```bash
docker inspect --format '{{json .NetworkSettings.Networks}}' my-app | jq
```

### Check a container's IP address on a network

```bash
docker inspect --format '{{.NetworkSettings.Networks.my-network.IPAddress}}' my-app
```

### List all containers on a network

```bash
docker network inspect my-network \
  --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}'
```

### Common issues

| Problem                                 | Likely Cause                                          | Fix                                              |
| --------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Container can't resolve another by name | Using default `bridge` network                        | Use a custom user-defined network                |
| Connection refused on published port    | Service not listening on `0.0.0.0` inside container   | Set `HOST=0.0.0.0` in app config                 |
| Port already in use                     | Host port conflict                                    | Change the host-side port: `-p 8081:3000`        |
| Can't reach database from app container | Containers on different networks                      | Add both to the same network                     |
| App works locally but not in CI         | Hard-coded `localhost` instead of service name        | Use service name as hostname: `db`, `cache`      |
| `host` mode not working on macOS        | macOS uses a Linux VM; host mode bypasses only the VM | Use bridge networking with port mapping on macOS |

---

## 11. Quick Reference

| Goal                    | Command                                          |
| ----------------------- | ------------------------------------------------ |
| Create a network        | `docker network create my-network`               |
| List networks           | `docker network ls`                              |
| Inspect a network       | `docker network inspect my-network`              |
| Connect container       | `docker network connect my-network <c>`          |
| Disconnect container    | `docker network disconnect my-network <c>`       |
| Remove network          | `docker network rm my-network`                   |
| Remove unused networks  | `docker network prune`                           |
| Publish port            | `docker run -p 127.0.0.1:8080:3000`              |
| Check published ports   | `docker port <container>`                        |
| Container's IP          | `docker inspect --format '{{...IPAddress}}' <c>` |
| Ping from container     | `docker exec <c> ping -c 3 <hostname>`           |
| Test TCP from container | `docker exec <c> nc -zv <host> <port>`           |
