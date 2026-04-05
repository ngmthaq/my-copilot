---
name: nginx-load-balancing
description: "Nginx load balancing — upstream blocks, algorithms (round-robin, least_conn, ip_hash, hash), health checks, weights, and failover. Use when: distributing traffic across backends; configuring high availability. DO NOT USE FOR: reverse proxy basics (use nginx-reverse-proxy); SSL termination (use nginx-ssl-tls-setup)."
---

# Nginx Load Balancing

## 1. Basic Upstream

```nginx
http {
    upstream backend {
        server 10.0.0.1:3000;
        server 10.0.0.2:3000;
        server 10.0.0.3:3000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend;
        }
    }
}
```

Default algorithm: **round-robin** — requests distributed evenly in order.

---

## 2. Load Balancing Algorithms

```nginx
# Round-robin (default) — equal distribution
upstream backend_rr {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

# Least connections — sends to server with fewest active connections
upstream backend_lc {
    least_conn;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

# IP hash — same client always goes to same server (sticky sessions)
upstream backend_ip {
    ip_hash;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

# Generic hash — custom key for consistent hashing
upstream backend_hash {
    hash $request_uri consistent;   # Same URI → same server
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

# Random with two choices — pick 2, choose least_conn
upstream backend_rand {
    random two least_conn;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}
```

---

## 3. Server Weights & States

```nginx
upstream backend {
    server 10.0.0.1:3000 weight=5;   # Gets 5x more traffic
    server 10.0.0.2:3000 weight=3;   # Gets 3x more traffic
    server 10.0.0.3:3000 weight=1;   # Gets 1x traffic (default)

    server 10.0.0.4:3000 backup;     # Only used when all others are down
    server 10.0.0.5:3000 down;       # Temporarily disabled
}
```

---

## 4. Passive Health Checks

```nginx
upstream backend {
    server 10.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:3000 max_fails=3 fail_timeout=30s;
    # After 3 failures within 30s → mark unavailable for 30s
}

server {
    location / {
        proxy_pass http://backend;

        proxy_next_upstream error timeout http_500 http_502 http_503;
        proxy_next_upstream_tries 2;      # Max retry attempts
        proxy_next_upstream_timeout 10s;  # Max time for retries
    }
}
```

---

## 5. Active Health Checks (Nginx Plus)

```nginx
upstream backend {
    zone backend_zone 64k;    # Shared memory for health state

    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

server {
    location / {
        proxy_pass http://backend;
        health_check interval=5s fails=3 passes=2;
        # Check every 5s, down after 3 failures, up after 2 passes
    }

    # Custom health check
    location / {
        proxy_pass http://backend;
        health_check uri=/health match=healthy;
    }

    match healthy {
        status 200;
        body ~ "ok";
    }
}
```

---

## 6. Session Persistence

```nginx
# IP-based (simple)
upstream backend {
    ip_hash;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

# Header-based routing
upstream backend {
    hash $http_x_session_id consistent;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}
```

---

## 7. Keepalive to Upstream

```nginx
upstream backend {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;

    keepalive 32;              # Keep 32 idle connections per worker
    keepalive_requests 1000;   # Max requests per keepalive connection
    keepalive_timeout 60s;
}

server {
    location / {
        proxy_pass http://backend;

        # Required for keepalive to upstream
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

---

## 8. Best Practices

- **Use `least_conn`** for backends with varying response times
- **Use `ip_hash`** only when session persistence is truly required
- **Set `max_fails` and `fail_timeout`** — don't send traffic to dead servers
- **Use `proxy_next_upstream`** to retry on failures transparently
- **Enable `keepalive`** to upstream — reduces connection overhead
- **Use `weight`** for canary releases or gradual rollouts
- **Use `backup`** servers for disaster recovery
- **Use `consistent` hashing** to minimize redistribution when scaling
