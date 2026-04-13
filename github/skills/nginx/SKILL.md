---
name: nginx
description: "Unified Nginx skill index — covers all Nginx topics including basic configuration, SSL/TLS setup, reverse proxy, load balancing, static file serving, caching strategies, URL rewriting, security hardening, performance tuning, and logging & monitoring. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Nginx Skill Index

## Sub-Skills Reference

| Domain               | File                                             | When to use                                                                               |
| -------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Basic Configuration  | [basic-configuration.md](basic-configuration.md) | Setting up Nginx from scratch; understanding config structure; configuring server blocks. |
| Caching Strategies   | [caching-strategies.md](caching-strategies.md)   | Configuring response caching; improving backend performance; setting cache headers.       |
| Load Balancing       | [load-balancing.md](load-balancing.md)           | Distributing traffic across backends; configuring high availability.                      |
| Logging & Monitoring | [logging-monitoring.md](logging-monitoring.md)   | Setting up logging; debugging requests; monitoring Nginx health.                          |
| Performance Tuning   | [performance-tuning.md](performance-tuning.md)   | Optimizing Nginx throughput; reducing latency; handling high concurrency.                 |
| Reverse Proxy        | [reverse-proxy.md](reverse-proxy.md)             | Proxying requests to backend services; setting up API gateways.                           |
| Security Hardening   | [security-hardening.md](security-hardening.md)   | Securing Nginx deployments; adding security headers; restricting access.                  |
| SSL/TLS Setup        | [ssl-tls-setup.md](ssl-tls-setup.md)             | Configuring HTTPS; setting up certificates; hardening TLS.                                |
| Static File Serving  | [static-file-serving.md](static-file-serving.md) | Serving static files; configuring asset delivery; setting up SPA.                         |
| URL Rewriting        | [url-rewriting.md](url-rewriting.md)             | Redirecting URLs; rewriting paths; migrating URL structures.                              |

---

## Quick Decision Guide

```
What is your goal?
│
├── Starting from scratch or understanding Nginx config structure?
│   └── → basic-configuration.md
│
├── Setting up HTTPS / TLS certificates / HTTP/2?
│   └── → ssl-tls-setup.md
│
├── Proxying requests to a Node.js / API backend?
│   ├── Single backend → reverse-proxy.md
│   └── Multiple backends with balancing → load-balancing.md
│
├── Serving HTML / CSS / JS / images from disk?
│   ├── Static files or SPA → static-file-serving.md
│   └── Caching upstream API responses → caching-strategies.md
│
├── Redirecting or rewriting URLs?
│   └── → url-rewriting.md
│
├── Hardening security?
│   ├── Security headers, rate limiting, access control → security-hardening.md
│   └── SSL/TLS hardening → ssl-tls-setup.md
│
├── Improving performance?
│   ├── Worker tuning, buffers, gzip, open_file_cache → performance-tuning.md
│   └── Response caching, microcaching → caching-strategies.md
│
└── Debugging or monitoring?
    └── → logging-monitoring.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above to find the right sub-skill.
2. **Load the sub-skill file** — read the corresponding `.md` file in this folder (e.g., `reverse-proxy.md`) to get patterns, examples, and best practices.
3. **Follow its patterns** — apply the config snippets and guidelines from that sub-skill directly.
4. **Load multiple sub-skills** when your task spans domains (e.g., setting up a secure, load-balanced API gateway means reading both `ssl-tls-setup.md` and `load-balancing.md`).

> All sub-skill files are co-located in this folder. Reference them by their relative path (e.g., `ssl-tls-setup.md`), not via the old `../nginx-ssl-tls-setup/SKILL.md` path.
