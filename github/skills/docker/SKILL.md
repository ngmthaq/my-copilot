---
name: docker
description: "Unified Docker skill index — covers all Docker topics including CLI commands, Dockerfile authoring, multi-stage builds, image optimization, container lifecycle management, networking, volumes, environment variables, Docker Compose, and production deployment. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Docker Skill

## Overview

This file is the top-level entry point for all Docker-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains detailed patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                | File                                                 | When to use                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basic CLI Commands    | [basic-commands.md](basic-commands.md)               | Running containers, pulling/building images, managing volumes or networks via CLI, viewing logs, executing shells, cleaning up Docker resources, scaling with Docker Compose |
| Image Building        | [image-building.md](image-building.md)               | Writing or improving Dockerfiles, choosing base images, configuring `.dockerignore`, setting `ARG`/`ENV`/`LABEL`, troubleshooting build failures                             |
| Multi-Stage Builds    | [multi-stage-builds.md](multi-stage-builds.md)       | Separating build and runtime stages, discarding devDependencies and build tools from the final image, building Node.js / NestJS / Express / React / Vue apps                 |
| Optimization          | [optimization.md](optimization.md)                   | Reducing image size, speeding up build times, layer caching, BuildKit features, resource limits, profiling image layers                                                      |
| Container Management  | [container-management.md](container-management.md)   | Creating, starting, stopping, pausing, or removing containers; inspecting state and logs; copying files; executing commands inside containers; restart policies              |
| Networking            | [networking.md](networking.md)                       | Creating and managing networks, container-to-container communication, bridge/host/overlay drivers, port publishing, DNS resolution, troubleshooting connectivity             |
| Volumes               | [volumes.md](volumes.md)                             | Named volumes, bind mounts, tmpfs mounts, persisting database data, sharing data between containers, backup and restore                                                      |
| Environment Variables | [environment-variables.md](environment-variables.md) | Passing env vars via `-e` or `--env-file`, `.env` file format, multi-environment setups, managing secrets securely                                                           |
| Docker Compose        | [compose-configuration.md](compose-configuration.md) | Writing `docker-compose.yml`, defining services/volumes/networks, health checks, `depends_on`, override files for dev/prod environments                                      |
| Deployment            | [deployment.md](deployment.md)                       | Pushing images to registries (Docker Hub, GHCR, ECR, GCR), CI/CD pipelines, production Compose configs, zero-downtime updates, VPS deployment                                |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Run / stop / inspect a container at runtime?
│   └── → container-management.md
│
├── Write or fix a Dockerfile?
│   ├── Single-stage?  → image-building.md
│   └── Multi-stage?   → multi-stage-builds.md
│
├── Make images smaller or builds faster?
│   └── → optimization.md
│
├── Manage networks or fix connectivity?
│   └── → networking.md
│
├── Manage persistent data or mounts?
│   └── → volumes.md
│
├── Handle environment variables or secrets?
│   └── → environment-variables.md
│
├── Orchestrate multiple containers locally?
│   └── → compose-configuration.md
│
├── Deploy to production or push to a registry?
│   └── → deployment.md
│
└── General CLI commands (pull, logs, exec, prune…)?
    └── → basic-commands.md
```

---

## How to Use This Skill

1. Identify the user's goal using the decision guide above.
2. Load the corresponding sub-skill file with `read_file`.
3. Follow the patterns and examples in that file to produce the response.
4. When a task spans multiple domains (e.g., writing a Dockerfile **and** a Compose file), load both sub-skill files before responding.
