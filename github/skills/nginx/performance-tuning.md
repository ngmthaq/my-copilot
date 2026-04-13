---
name: nginx-performance-tuning
description: "Nginx performance tuning — worker processes, connections, buffers, timeouts, gzip, open file cache, and kernel tuning. Use when: optimizing Nginx throughput; reducing latency; handling high concurrency. DO NOT USE FOR: caching (use nginx-caching-strategies); load balancing (use nginx-load-balancing)."
---

# Nginx Performance Tuning

## 1. Worker Processes & Connections

```nginx
# Main context
worker_processes auto;           # 1 per CPU core
worker_cpu_affinity auto;        # Bind workers to CPU cores
worker_rlimit_nofile 65535;      # Max open files per worker

events {
    worker_connections 4096;     # Max connections per worker
    multi_accept on;             # Accept all pending connections at once
    use epoll;                   # Linux: use epoll (default on modern kernels)
}
```

**Max concurrent connections** = `worker_processes` x `worker_connections`

---

## 2. Buffers & Request Handling

```nginx
http {
    # Client request buffers
    client_body_buffer_size   16k;     # Buffer for POST body
    client_header_buffer_size 1k;      # Buffer for request headers
    large_client_header_buffers 4 8k;  # Large headers (cookies, etc.)
    client_max_body_size      10m;     # Max upload size

    # Proxy buffers (for upstream responses)
    proxy_buffering on;
    proxy_buffer_size 4k;              # First part of response (headers)
    proxy_buffers 8 16k;               # 8 buffers of 16k for response body
    proxy_busy_buffers_size 32k;       # Max size sent to client while buffering

    # Disable buffering for streaming/SSE
    location /events {
        proxy_buffering off;
        proxy_cache off;
    }
}
```

---

## 3. Timeouts

```nginx
http {
    # Client timeouts
    client_body_timeout   12s;   # Time to receive request body
    client_header_timeout 12s;   # Time to receive request headers
    send_timeout          10s;   # Time between two write operations

    # Keepalive
    keepalive_timeout  65s;      # Keep connection open
    keepalive_requests 1000;     # Max requests per keepalive connection

    # Proxy timeouts
    proxy_connect_timeout 5s;    # Time to connect to upstream
    proxy_send_timeout    10s;   # Time to send request to upstream
    proxy_read_timeout    30s;   # Time to read response from upstream
}
```

---

## 4. Gzip Compression

```nginx
http {
    gzip on;
    gzip_vary on;                    # Add Vary: Accept-Encoding header
    gzip_proxied any;                # Compress proxied responses too
    gzip_comp_level 4;               # 1-9, 4-6 is sweet spot
    gzip_min_length 256;             # Don't compress tiny responses
    gzip_http_version 1.1;

    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/rss+xml
        image/svg+xml;
}
```

---

## 5. Open File Cache

```nginx
http {
    # Cache file descriptors, sizes, and errors
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;       # Recheck every 30s
    open_file_cache_min_uses 2;      # Cache after 2 accesses
    open_file_cache_errors on;       # Cache file-not-found errors too
}
```

---

## 6. Sendfile & TCP Optimizations

```nginx
http {
    sendfile on;           # Kernel-level file transfer (skip user space)
    tcp_nopush on;         # Send headers and file in one packet
    tcp_nodelay on;        # Disable Nagle's algorithm for keepalive
    reset_timedout_connection on;  # Free memory from timed-out connections
}
```

---

## 7. Rate Limiting (Protect Performance)

```nginx
http {
    # Define rate limit zone
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    server {
        # Apply rate limit
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            # 10 req/s sustained, burst up to 20, reject excess immediately

            limit_conn addr 10;  # Max 10 concurrent connections per IP
        }
    }
}
```

---

## 8. Kernel Tuning (sysctl)

```bash
# /etc/sysctl.d/99-nginx.conf

# Max open files
fs.file-max = 65535

# TCP optimizations
net.core.somaxconn = 65535              # Max listen backlog
net.core.netdev_max_backlog = 5000      # Network interface queue
net.ipv4.tcp_max_syn_backlog = 65535    # SYN queue size

# Connection reuse
net.ipv4.tcp_tw_reuse = 1              # Reuse TIME_WAIT sockets
net.ipv4.ip_local_port_range = 1024 65535

# Buffers
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
```

```bash
sysctl -p /etc/sysctl.d/99-nginx.conf   # Apply changes
```

---

## 9. Best Practices

- **Set `worker_processes auto`** — matches CPU cores automatically
- **Tune `worker_connections`** based on expected concurrency (check with `ulimit -n`)
- **Use gzip level 4-6** — higher levels give diminishing returns for CPU cost
- **Enable `sendfile`** — massive improvement for static file serving
- **Enable `open_file_cache`** for servers with many static files
- **Set proxy timeouts** shorter than client timeouts — fail fast
- **Use `proxy_buffering on`** (default) — frees upstream connections faster
- **Rate limit** to protect against abuse, not to throttle normal traffic
- **Monitor with `stub_status`** before and after tuning to measure impact
